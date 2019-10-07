import devUtils from '@aztec/dev-utils';
import bn128 from '@aztec/bn128';
import aztec from 'aztec.js';
import TestAuthService from './helpers/AuthService';

import ERC20Mintable from '../../../../build/contracts/ERC20Mintable';
import ZkAssetOwnable from '../../../../build/contracts/ZkAssetOwnable';
import JoinSplit from '../../../../build/contracts/JoinSplit';

import Web3Service from '~background/services/Web3Service';
import { fetchNotes } from '../../services/EventService/utils/note';
import {
    createBulkAssets,
} from '../../services/EventService/utils/asset';
import {
    AZTECAccountRegistryConfig,
    ACEConfig,
} from '~background/config/contracts';
import Web3ServiceFactory from '~background/services/Web3Service/factory';
import createNewAsset from './helpers/createNewAsset';
import mint from './helpers/mint';
import approve from './helpers/approve';
import generateNotes from './helpers/generateNotes';
import {
    errorLog,
    warnLog,
    log,
} from '~utils/log';

import AuthService from '~background/services/AuthService';
import SyncService from '~background/services/SyncService';
import NoteService from '~background/services/NoteService';
import EventService from '~background/services/EventService';


jest.mock('~utils/storage');
jest.setTimeout(500000000);

const {
    JoinSplitProof,
    ProofUtils,
} = aztec;

describe('ZkAsset', () => {
    const networkId = 0;
    const providerUrl = 'ws://localhost:8545';
    const prepopulateNotesCount = 8427;
    const eachNoteBalance = 1;
    const epoch = 1;
    const filter = 17;
    const scalingFactor = 1;
    const depositAmount = prepopulateNotesCount * eachNoteBalance;
    const sender = TestAuthService.getAccount();

    let erc20Address;
    let zkAssetAddress = '0xE4edF908D85B0Dd7954ac7fc4aC5FCe42F8cBcd8';
    let outputNotes;
    let depositProof;
    let web3Service;

    const configureWeb3Service = async () => {
        const contractsConfigs = [
            AZTECAccountRegistryConfig.config,
            ACEConfig.config,
        ];

        const ganacheNetworkConfig = {
            title: 'Ganache',
            networkId: 0,
            providerUrl,
            contractsConfigs,
        };

        Web3ServiceFactory.setConfigs([
            ...[ganacheNetworkConfig],
        ]);
    };

    beforeAll(async () => {
        configureWeb3Service();
        web3Service = Web3Service(networkId, sender);
        const aceAddress = web3Service.contract('ACE').address;

        log(`aceAddress: ${aceAddress}`);

        const {
            error,
            groupedNotes,
        } = await fetchNotes({
            fromBlock: 1,
            toBlock: 'latest',
            networkId,
        });

        if (error) {
            errorLog('Cannot fetch all notes', error);
        }

        const eventsInGanache = groupedNotes.allNotes();
        log(`Already eventsInGanache: ${eventsInGanache.length}`);
        if (eventsInGanache.length >= prepopulateNotesCount) return;

        await web3Service
            .useContract('ACE')
            .method('setCommonReferenceString')
            .send(bn128.CRS);

        if (!zkAssetAddress) {
            log('Creating new asset...');
            ({
                erc20Address,
                zkAssetAddress,
            } = await createNewAsset({
                zkAssetType: 'ZkAssetMintable',
                scalingFactor,
                web3Service,
            }));

            log('New zk mintable asset created!');
            warnLog(
                'Add this address to demo file to prevent creating new asset:',
                zkAssetAddress,
            );
        }

        web3Service.registerContract(JoinSplit);
        web3Service.registerContract(ZkAssetOwnable, { address: zkAssetAddress });

        if (!erc20Address) {
            erc20Address = await web3Service
                .useContract('ZkAssetOwnable')
                .at(zkAssetAddress)
                .method('linkedToken')
                .call();
        }
        web3Service.registerContract(ERC20Mintable, { address: erc20Address });

        mint({
            web3Service,
            erc20Address,
            owner: sender.address,
            amount: depositAmount,
        });

        approve({
            web3Service,
            erc20Address,
            aceAddress,
            amount: depositAmount,
        });

        const notesPerRequest = 5;
        let createdNotes = eventsInGanache.length;

        await web3Service
            .useContract('ZkAssetOwnable')
            .at(zkAssetAddress)
            .method('setProofs')
            .send(
                epoch,
                filter,
            );

        do {
            const inputNotes = [];
            const depositInputOwnerAccounts = [];

            // outputNotes with 1 balances
            const noteValues = new Array(notesPerRequest);
            noteValues.fill(1);

            // eslint-disable-next-line no-await-in-loop
            outputNotes = await generateNotes(noteValues, sender);
            const publicValue = ProofUtils.getPublicValue(
                [],
                noteValues,
            );

            depositProof = new JoinSplitProof(
                inputNotes,
                outputNotes,
                sender.address,
                publicValue,
                sender.address,
            );

            // eslint-disable-next-line no-await-in-loop
            await web3Service
                .useContract('ACE')
                .method('publicApprove')
                .send(
                    zkAssetAddress,
                    depositProof.hash,
                    depositAmount,
                );

            const depositData = depositProof.encodeABI(zkAssetAddress);
            const depositSignatures = depositProof.constructSignatures(
                zkAssetAddress,
                depositInputOwnerAccounts,
            );

            // eslint-disable-next-line no-await-in-loop
            await web3Service
                .useContract('ZkAssetOwnable')
                .at(zkAssetAddress)
                .method('confidentialTransfer')
                .send(
                    depositData,
                    depositSignatures,
                );

            createdNotes += (notesPerRequest + 1);

            log(`Progress prepopulation: ${parseInt(createdNotes * 100 / prepopulateNotesCount)} %`);
        } while (createdNotes < prepopulateNotesCount);
    });

    beforeEach(async () => {
        // syncManager = new SyncManager();
        // syncManager.setConfig({
        //     blocksPerRequest: 99999999999,
        // });
    });

    it(`check how does it take to fetch ${prepopulateNotesCount} events, filter by owner and store into faked db`, async () => {
        // given
        const {
            address: userAddress,
            privateKey,
        } = sender;

        await EventService.addAccountToSync({
            address: sender.address,
            networkId,
        });

        const {
            error,
            account,
        } = await EventService.fetchAztecAccount({
            address: userAddress,
            networkId,
        });

        const {
            linkedPublicKey,
            blockNumber: accountBlockNumber,
            spendingPublicKey,
        } = account;

        await AuthService.registerAddress({
            address: userAddress,
            linkedPublicKey,
            spendingPublicKey,
            blockNumber: accountBlockNumber,
        });

        const {
            error: assetError,
            asset,
        } = await EventService.fetchAsset({
            address: zkAssetAddress,
            networkId,
        });
        await createBulkAssets([asset], networkId);

        if (error) {
            errorLog('Error occured during fetchAsset', assetError);
            return;
        }

        NoteService.initWithUser(
            userAddress,
            privateKey,
            linkedPublicKey,
        );

        // Action

        const tStart = performance.now();
        let t0 = tStart;
        let t1;
        /**
         * Syncing notes with syncNotes
         */
        await new Promise((resolve, reject) => {
            const onCompleatePulling = (result) => {
                resolve(result);
            };

            const onFailurePulling = (result) => {
                reject(result.error);
            };

            EventService.syncNotes({
                address: userAddress,
                networkId,
                fromAssets: [asset],
                callbacks: {
                    onCompleatePulling,
                    onFailurePulling,
                },
            });
        });
        t1 = performance.now();
        console.log(`Syncing notes with syncNotes took: ${((t1 - t0) / 1000)} seconds.`);

        /**
         * Sync account with syncAccount
         */
        t0 = performance.now();
        await new Promise((resolve, reject) => {
            const onCompleate = (result) => {
                console.log(`Finished SyncService: ${result}`);
                resolve();
            };

            SyncService.syncAccount({
                address: userAddress,
                privateKey,
                networkId,
                onCompleate,
            });
        });
        t1 = performance.now();
        console.log(`Syncing notes and decryption with sync service took: ${((t1 - t0) / 1000)} seconds.`);
    });
});
