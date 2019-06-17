const { constants } = require('@aztec/dev-utils');
const BN = require('bn.js');
const crypto = require('crypto');
const { isHexStrict } = require('web3-utils');

const bn128 = require('../bn128');

class ProofUtils {
    /**
     * Calculate the public value based on the values of the input notes and output notes
     *
     * @param {number[]} kIn array of input note values
     * @param {number[]} kOut array of output note values
     * @returns {number} net value of the input notes and output notes
     */
    static getPublicValue(kIn, kOut) {
        return kOut.reduce((acc, value) => acc - value, kIn.reduce((acc, value) => acc + value, 0));
    }

    /**
     * Validate if the given string is an Ethereum address. We also accept left-padded 32 bytes addresses.
     *
     * @param {address} string to verify
     * @returns {bool} true if the string is an Ethereum address
     */
    static isEthereumAddress(address) {
        if (!address) {
            return false;
        }
        if (
            (address.length === 42 && isHexStrict(address)) ||
            (address.length === 66 && isHexStrict(address) && address.startsWith('0x000000000000000000000000'))
        ) {
            return true;
        }
        return false;
    }

    /**
     * Validate point is on curve
     *
     * @param {BN[]} point bn.js format of a point on the curve
     * @returns {boolean} true if point is on curve, false if not
     */
    static validatePointOnCurve(point) {
        const lhs = point.y.redSqr();
        const rhs = point.x
            .redSqr()
            .redMul(point.x)
            .redAdd(bn128.curve.b);
        return lhs.fromRed().eq(rhs.fromRed());
    }
}

module.exports = ProofUtils;
