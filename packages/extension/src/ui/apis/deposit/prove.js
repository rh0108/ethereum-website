import aztec from 'aztec.js';
import {
    randomSumArray,
} from '~utils/random';
import {
    createNotes,
} from '~utils/note';
import settings from '~background/utils/settings';
import {
    getNoteOwnerAccount,
    getExtensionAccount,
} from '~ui/apis/account';

const {
    JoinSplitProof,
    ProofUtils,
} = aztec;

export default async function deposit({
    owner,
    transactions,
    publicOwner,
    numberOfOutputNotes,
}) {
    const notesOwner = await getNoteOwnerAccount(owner);
    console.log('notesOwner', notesOwner);

    const {
        address: notesOwnerAddress,
        spendingPublicKey,
    } = notesOwner;

    const numberOfNotes = numberOfOutputNotes > 0
        ? numberOfOutputNotes
        : await settings('NUMBER_OF_OUTPUT_NOTES');
    const outputTransactionNotes = await Promise.all(
        transactions.map(async (tx) => {
            const noteValues = randomSumArray(tx.amount, numberOfNotes);
            const {
                linkedPublicKey,
            } = await getExtensionAccount(tx.to);

            const notes = await createNotes(
                noteValues,
                // TODO this needs to change to the actual spending public key
                spendingPublicKey,
                tx.to,
                linkedPublicKey,
            );
            return {
                notes,
                noteValues,
            };
        }),
    );

    const { outputNotes, outputNoteValues } = outputTransactionNotes.reduce(
        ({ notes, values }, obj) => ({
            outputNotes: notes.concat(obj.notes),
            outputNoteValues: values.concat(obj.noteValues),
        }), { notes: [], values: [] },
    );

    const publicValue = ProofUtils.getPublicValue(
        [],
        outputNoteValues,
    );
    const inputNotes = [];

    const proof = new JoinSplitProof(
        inputNotes,
        outputNotes,
        notesOwnerAddress,
        publicValue,
        publicOwner,
    );

    return {
        proof,
        notes: outputNotes,
        notesOwner,
    };
}
