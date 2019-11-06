import cloneDeep from 'lodash/cloneDeep';
import {
    get,
} from '~utils/storage';
import {
    warnLog,
    errorLog,
} from '~utils/log';
import {
    PriorityQueue,
} from '~utils/dataStructures';
import metadata from '~utils/metadata';
import {
    fromHexString,
} from '~utils/encryptedViewingKey';
import {
    valueFromViewingKey,
} from '~utils/note';
import {
    isDestroyed,
} from '~utils/noteStatus';
import noteModel from '~/background/database/models/note';
import {
    defaultMaxProcesses,
    defaultNotesPerDecryptionBatch,
} from '../config';
import recoverAssetNotesFromStorage from '../utils/recoverAssetNotesFromStorage';
import createNoteKey from '../utils/createNoteKey';
import saveToStorage from '../utils/saveToStorage';

export default class Asset {
    constructor({
        assetId,
        networkId,
        owner,
        noteBucketCache,
        rawNoteManager,
        balance = 0,
        lastSynced = -1,
        maxProcesses = defaultMaxProcesses,
        notesPerDecryptionBatch = defaultNotesPerDecryptionBatch,
    }) {
        this.id = assetId;
        this.networkId = networkId;
        this.owner = owner;

        this.noteBucketCache = noteBucketCache;
        this.rawNoteManager = rawNoteManager;

        this.balance = balance;
        this.lastSynced = lastSynced;

        this.locked = true;
        this.modified = false;
        this.synced = false;

        this.maxProcesses = maxProcesses;
        this.activeProcesses = new Set();
        this.pendingProcesses = new PriorityQueue();
        this.actionQueue = [];
        this.notesPerDecryptionBatch = notesPerDecryptionBatch;

        this.eventListeners = {
            synced: [],
        };
    }

    addListener(eventName, cb) {
        if (!this.eventListeners[eventName]) {
            const events = Object.keys(this.eventListeners)
                .map(name => `'${name}'`)
                .join(', ');
            warnLog(
                `Cannot call Asset.addListener('${eventName}').`,
                `Available events: [${events}].`,
            );
            return;
        }

        this.eventListeners[eventName].push(cb);
    }

    removeListener(eventName, cb) {
        if (!this.eventListeners[eventName]) {
            const events = Object.keys(this.eventListeners)
                .map(name => `'${name}'`)
                .join(', ');
            warnLog(
                `Cannot call Asset.removeListener('${eventName}').`,
                `Available events: [${events}].`,
            );
            return;
        }

        const toRemove = this.eventListeners[eventName]
            .findIndex(listener => listener === cb);
        if (toRemove >= 0) {
            this.eventListeners[eventName].splice(toRemove, 1);
        }
    }

    notifyListeners(eventName, ...params) {
        const listeners = this.eventListeners[eventName];
        listeners.forEach(cb => cb(...params));
    }

    ensureUnlocked(action) {
        if (!this.locked) {
            action();
            return null;
        }

        return new Promise((resolve) => {
            this.actionQueue.push({
                resolve,
                action,
            });
        });
    }

    lock() {
        this.locked = true;
    }

    unlock() {
        while (this.actionQueue.length) {
            const {
                action,
                resolve,
            } = this.actionQueue.shift();
            resolve(action());
        }
        this.locked = false;
    }

    async startSync() {
        this.unlock(); // flush previous stashed action

        this.rawNoteManager.setAssetLastSynced(this.id, this.lastSynced);

        if (this.pendingProcesses.size) {
            this.runNextProcess();
        } else {
            if (!this.noteBucketCache.has(this.id)) {
                await this.restore();
            }

            this.addProcess(async () => this.getRawNotes());
        }
    }

    async runProcess(ps) {
        this.synced = false;
        this.activeProcesses.add(ps);
        await ps();
        this.activeProcesses.delete(ps);
        if (!this.activeProcesses.size
            && !this.pendingProcesses.size
        ) {
            this.lastSynced = this.rawNoteManager.getCurrentSynced(this.id);
            this.synced = true;
            this.notifyListeners('synced', this.id);
        } else {
            this.runNextProcess();
        }
    }

    async runNextProcess() {
        while (this.activeProcesses.size < this.maxProcesses
            && !this.locked
        ) {
            const ps = this.pendingProcesses.removeTop();
            if (!ps) {
                return;
            }
            this.runProcess(ps);
        }
    }

    addProcess(ps) {
        this.pendingProcesses.addToBottom(ps);
        this.runNextProcess();
    }

    getSnapshot() {
        this.lock();
        const summary = {
            balance: this.balance,
            lastSynced: this.lastSynced,
            size: this.noteBucketCache.getSize(this.id),
        };
        const noteValues = cloneDeep(this.noteBucketCache.get(this.id));
        this.unlock();

        return {
            ...summary,
            noteValues,
        };
    }

    async restore() {
        const noteValues = await recoverAssetNotesFromStorage(
            this.networkId,
            this.owner,
            this.id,
        );
        await this.ensureUnlocked(() => this.noteBucketCache.set(this.id, noteValues));
    }

    async getRawNotes() {
        const notes = await this.rawNoteManager.fetchAndRemove(this.id);
        if (!notes.length) return;

        for (let i = 0; i < notes.length; i += this.notesPerDecryptionBatch) {
            this.addProcess(async () => this.decryptNotes(notes.slice(
                i,
                i + this.notesPerDecryptionBatch,
            )));
        }
        this.addProcess(async () => this.getRawNotes());
    }

    async decryptNotes(rawNotes) {
        if (!rawNotes.length) return;

        this.modified = true;

        const {
            address,
            linkedPrivateKey,
        } = this.owner;
        await Promise.all(rawNotes.map(async (note) => {
            const {
                noteHash,
                blockNumber,
                status,
            } = note;

            const destroyed = isDestroyed(status);
            let key = await get(noteHash);

            if (destroyed && !key) {
                return;
            }

            let {
                metadata: metadataStr,
            } = note;
            if (!metadataStr) {
                ({
                    metadata: metadataStr,
                } = await noteModel.get(
                    { networkId: this.networkId },
                    noteHash,
                ));
            }

            let value;
            try {
                const metadataObj = metadata(metadataStr);
                const {
                    viewingKey,
                } = metadataObj.getAccess(address) || {};
                const realViewingKey = fromHexString(viewingKey).decrypt(linkedPrivateKey);
                value = valueFromViewingKey(realViewingKey);
            } catch (error) {
                errorLog(error);
                this.ensureUnlocked(() => {
                    if (blockNumber > this.lastSynced) {
                        this.lastSynced = blockNumber;
                    }
                });
                return;
            }

            if (!key) {
                key = await createNoteKey(noteHash);
            }

            this.ensureUnlocked(() => {
                const decryptedNote = {
                    key,
                    value,
                };
                if (destroyed) {
                    if (this.noteBucketCache.remove(this.id, decryptedNote)) {
                        this.balance -= value;
                    }
                } else if (this.noteBucketCache.add(this.id, decryptedNote)) {
                    this.balance += value;
                }

                if (blockNumber > this.lastSynced) {
                    this.lastSynced = blockNumber;
                }
            });
        }));
    }

    async save() {
        if (this.activeProcesses.size > 0
            || this.actionQueue.length > 0
        ) {
            warnLog(
                'Avoid calling "save" on Asset when there are still processes running.',
                `Asset id: ${this.id}`,
            );
            return;
        }

        const {
            noteValues,
            ...summary
        } = this.getSnapshot();

        const data = {
            assetSummary: {
                [this.id]: summary,
            },
        };
        if (noteValues) {
            data.assetNotes = {
                [this.id]: noteValues,
            };
        }
        await saveToStorage(
            this.networkId,
            this.owner,
            data,
        );
        if (summary.lastSynced === this.lastSynced) {
            this.modified = false;
        }
    }
}
