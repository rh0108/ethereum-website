import decodePrivateKey from '~background/utils/decodePrivateKey';
import {
    fromHexString,
} from '~utils/encryptedViewingKey';
import metadata from '~utils/metadata';
import {
    valueFromViewingKey,
} from '~utils/note';
import {
    argsError,
} from '~utils/error';
import Note from '~background/database/models/note';
import syncLatestNoteOnChain from './syncLatestNoteOnChain';

export default async function syncNoteInfo(args, ctx) {
    const {
        id: noteId,
    } = args;

    if (!noteId) {
        return null;
    }

    const {
        user: { address: userAddress },
        networkId = 0,
    } = ctx;

    let note = await Note.get({ networkId }, noteId);

    const {
        viewingKey,
    } = metadata(note.metadata).getAccess(userAddress);
    if (!note) {
        [note] = await syncLatestNoteOnChain({
            account: userAddress,
            noteId,
            networkId,
        }) || [];
    }

    if (!note) {
        throw argsError('note.not.found', {
            noteId,
        });
    }

    const {
        keyStore,
        session: {
            pwDerivedKey,
        },
    } = ctx;
    const privateKey = decodePrivateKey(keyStore, pwDerivedKey);
    const realViewingKey = fromHexString(viewingKey).decrypt(privateKey);
    const value = valueFromViewingKey(realViewingKey);

    return {
        ...note,
        value,
    };
}
