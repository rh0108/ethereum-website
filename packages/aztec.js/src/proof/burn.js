/* eslint-disable func-names */
const {
    getProof,
    setDefaultEpoch,
    helpers,
} = require('./exportHandler');
const { BURN } = require('./base/types');

/**
 * Export the BurnProof for a default epoch
 *
 * @method BurnProof
 * @param  {...any} args - rest parameter representing the proof inputs
 * @returns A BurnProof construction for the default epoch
 */
function BurnProof(...args) {
    const Proof = getProof(BURN.name, this.epochNum);

    return new Proof(...args);
}

/**
 * Export the BurnProof for a given epoch number
 *
 * @method epoch
 * @param {Number} epochNum - epoch number for which a BurnProof is to be returned
 * @param {bool} setAsDefault - if true, sets the inputted epochNum to be the default. If false, does
 * not set the inputted epoch number to be the default
 * @returns A BurnProof construction for the given epoch number
 */
BurnProof.epoch = function(epochNum, setAsDefault = false) {
    helpers.validateEpochNum(BURN.name, epochNum);

    if (setAsDefault) {
        setDefaultEpoch(BURN.name, epochNum);
    }

    return (...args) => {
        return BurnProof.call({ epochNum }, ...args);
    };
};

module.exports = BurnProof;
