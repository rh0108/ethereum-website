const JoinSplitFluidProof = require('../index');
const { ProofType } = require('../../proof');

class MintProof extends JoinSplitFluidProof {
    /**
     * Construct a mint proof. A mint proof artificially creates AZTEC notes, without a transfer of public ERC20 tokens.
     * It keeps track of the total number of AZTEC notes minted using the variables `currentTotalValueNote` and `newTotalValueNote`,
     * notes whose value represents the number minted.
     *
     * The balancing relationship being satisfied is:
     *
     * currentTotalValue = newTotalValue + mintedNotesValue
     *
     * @param {Object} currentTotalValueNote - note whose value represents the total current value of minted or burned notes
     * @param {Object} newTotalValueNote - note whose value represents the new total value of minted or burned notes
     * @param {Object[]} mintedNotes - notes to be minted or burned
     * @param {string} sender - Ethereum address of the transaction sender
     * @param {string} metadata
     */
    constructor(currentTotalValueNote, newTotalValueNote, mintedNotes, sender, metadata) {
        super(ProofType.MINT.name, currentTotalValueNote, newTotalValueNote, mintedNotes, sender, metadata);
    }
}

module.exports = MintProof;
