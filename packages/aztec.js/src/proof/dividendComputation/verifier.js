const { constants: { K_MAX } } = require('@aztec/dev-utils');
const BN = require('bn.js');
const { padLeft } = require('web3-utils');


const Keccak = require('../../keccak');
const bn128 = require('../../bn128');
const helpers = require('./helpers');

const { groupReduction } = bn128;

const verifier = {};


/**
 * Verify AZTEC dividend computation proof transcript
 *
 * @method verifyProof
 * @param {Object[]} proofData - proofData array of AZTEC notes
 * @param {BN} challenge - challenge variable used in zero-knowledge protocol
 * @returns {number} - returns 1 if proof is validated, throws an error if not
 */
verifier.verifyProof = (proofData, challenge, sender, za, zb) => {
    let zaBN;
    let zbBN;
    const K_MAXBN = new BN(K_MAX);
    const kBarArray = [];

    // toBnAndAppendPoints appends gamma and sigma to the end of proofdata as well
    const proofDataBn = helpers.toBnAndAppendPoints(proofData);

    const formattedChallenge = (new BN(challenge.slice(2), 16)).toRed(groupReduction);

    // Check that proof data lies on the bn128 curve
    proofDataBn.forEach((proofElement) => {
        const gammaOnCurve = bn128.curve.validate(proofElement[6]); // checking gamma point
        const sigmaOnCurve = bn128.curve.validate(proofElement[7]); // checking sigma point

        if ((gammaOnCurve === false) || (sigmaOnCurve === false)) {
            throw new Error('point not on curve');
        }
    });

    // convert to bn.js instances if not already
    if (BN.isBN(za)) {
        zaBN = za;
    } else {
        zaBN = new BN(za);
    }

    if (BN.isBN(zb)) {
        zbBN = zb;
    } else {
        zbBN = new BN(zb);
    }

    // Check that za and zb are less than k_max
    if (zaBN.gte(K_MAXBN)) {
        throw new Error('z_a is greater than or equal to kMax');
    }

    if (zbBN.gte(K_MAXBN)) {
        throw new Error('z_b is greater than or equal to kMax');
    }

    const rollingHash = new Keccak();

    // Append note data to rollingHash
    proofDataBn.forEach((proofElement) => {
        rollingHash.append(proofElement[6]);
        rollingHash.append(proofElement[7]);
    });

    // Create finalHash and append to it - in same order as the proof construction code (otherwise final hash will be different)
    const finalHash = new Keccak();
    finalHash.appendBN(new BN(sender.slice(2), 16));
    finalHash.appendBN(zaBN);
    finalHash.appendBN(zbBN);
    finalHash.data = [...finalHash.data, ...rollingHash.data];

    let x = new BN(0).toRed(groupReduction);
    x = rollingHash.keccak(groupReduction);

    proofDataBn.map((proofElement, i) => {
        let kBar = proofElement[0];
        const aBar = proofElement[1];
        const gamma = proofElement[6];
        const sigma = proofElement[7];
        let B;


        if (i === 0) { // input note
            const kBarX = kBar.redMul(x); // xbk = bk*x
            const aBarX = aBar.redMul(x); // xba = ba*x
            const challengeX = formattedChallenge.mul(x);
            x = rollingHash.keccak(groupReduction);
            B = gamma.mul(kBarX).add(bn128.h.mul(aBarX)).add(sigma.mul(challengeX).neg());
            kBarArray.push(kBar);
        }

        if (i === 1) { // output note
            const aBarX = aBar.redMul(x);
            const kBarX = kBar.redMul(x);
            const challengeX = formattedChallenge.mul(x);
            x = rollingHash.keccak(groupReduction);
            B = gamma.mul(kBarX).add(bn128.h.mul(aBarX)).add(sigma.mul(challengeX).neg());
            kBarArray.push(kBar);
        }

        if (i === 2) { // residual note
            const zbRed = zbBN.toRed(groupReduction);
            const zaRed = zaBN.toRed(groupReduction);

            // kBar_3 = (z_b)(kBar_1) - (z_a)(kBar_2)
            kBar = (zbRed.redMul(kBarArray[0])).redSub(zaRed.redMul(kBarArray[1]));

            const aBarX = aBar.redMul(x);
            const kBarX = kBar.redMul(x);
            const challengeX = formattedChallenge.redMul(x);
            x = rollingHash.keccak(groupReduction);

            B = gamma.mul(kBarX).add(bn128.h.mul(aBarX)).add(sigma.mul((challengeX).neg()));
            kBarArray.push(kBar);
        }

        if (B === null) {
            throw new Error('undefined blinding factor');
        } else {
            finalHash.append(B);
        }

        return {
            kBar,
            B,
        };
    });

    const recoveredChallenge = finalHash.keccak(groupReduction);
    const finalChallenge = `0x${padLeft(recoveredChallenge.toString(16), 64)}`;

    // Check if the recovered challenge, matches the original challenge. If so, proof construction is validated
    if (finalChallenge !== challenge) {
        throw new Error('proof validation failed');
    } else {
        return true;
    }
};

module.exports = verifier;
