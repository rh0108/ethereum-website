/* eslint-disable func-names */
const { getProof, setDefaultEpoch, helpers } = require('./exportHandler');
const { JOIN_SPLIT } = require('./base/types');

/**
 * Export the JoinSplitProof for a default epoch
 *
 * @method JoinSplitProof
 * @param  {...any} args - rest parameter representing the proof inputs
 * @returns A JoinSplitProof construction for the default epoch
 */
function JoinSplitProof(...args) {
    const Proof = getProof(JOIN_SPLIT.name, this.epochNum);

    return new Proof(...args);
}

/**
 * Export the JoinSplitProof for a given epoch number
 *
 * @method epoch
 * @param {Number} epochNum - epoch number for which a JoinSplitProof is to be returned
 * @param {bool} setAsDefault - if true, sets the inputted epochNum to be the default. If false, does
 * not set the inputted epoch number to be the default
 * @returns A JoinSplitProof construction for the given epoch number
 */
JoinSplitProof.epoch = function(epochNum, setAsDefault = false) {
    helpers.validateEpochNum(JOIN_SPLIT.name, epochNum);

    if (setAsDefault) {
        setDefaultEpoch(JOIN_SPLIT.name, epochNum);
    }

    return (...args) => {
        return JoinSplitProof.call({ epochNum }, ...args);
    };
};

module.exports = JoinSplitProof;
