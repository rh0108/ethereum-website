/**
 * @module joinSplit
 */

const {
    constants,
    proofs,
    errors: {
        customError,
    },
} = require('@aztec/dev-utils');
const BN = require('bn.js');
const {
    padLeft,
} = require('web3-utils');

const extractor = require('./extractor');
const helpers = require('./helpers');
const proofUtils = require('../proofUtils');
const verifier = require('./verifier');

const abiEncoder = require('../../abiEncoder');
const bn128 = require('../../bn128');
const Keccak = require('../../keccak');
const signer = require('../../signer');

const {
    groupReduction,
} = bn128;
const {
    outputCoder,
    inputCoder,
} = abiEncoder;

const joinSplit = {};
joinSplit.extractor = extractor;
joinSplit.helpers = helpers;
joinSplit.verifier = verifier;

/**
 * Construct blinding factors
 *
 * @method constructBlindingFactors
 * @param {Object[]} notes AZTEC notes
 * @param {number} m number of input notes
 * @param {Object} rollingHash hash containing note coordinates (gamma, sigma) 
 * @param {Object[]} blindingScalars blinding scalars used in generating blindingFactors
 * @param {Object[]} notes AZTEC notes

 * @returns {Object[]} blinding factors
 */
joinSplit.constructBlindingFactors = (notes, m, rollingHash, blindingScalars) => {
    let B;
    let x = new BN(0).toRed(groupReduction);
    let runningBk = new BN(0).toRed(groupReduction);

    return notes.map((note, i) => {
        const {
            bk,
            ba,
        } = blindingScalars[i];
        if (i + 1 > m) {
            // get next iteration of our rolling hash
            x = rollingHash.keccak(groupReduction);
            const xbk = bk.redMul(x);
            const xba = ba.redMul(x);
            runningBk = runningBk.redSub(bk);
            B = note.gamma.mul(xbk).add(bn128.h.mul(xba));
        } else {
            runningBk = runningBk.redAdd(bk);
            B = note.gamma.mul(bk).add(bn128.h.mul(ba));
        }
        return {
            bk,
            ba,
            B,
            x,
        };
    });
};

/**
 * Construct AZTEC join-split proof transcript
 *
 * @method constructProof
 * @memberof module:joinSplit
 * @param {Object[]} notes array of AZTEC notes
 * @param {number} m number of input notes
 * @param {string} sender Ethereum address of transaction sender
 * @param {string} kPublic public commitment being added to proof
 * @returns {Object} proof data and challenge
 */
joinSplit.constructProof = (notes, m, sender, kPublic) => {
    // rolling hash is used to combine multiple bilinear pairing comparisons into a single comparison
    const rollingHash = new Keccak();
    // convert kPublic into a BN instance if it is not one
    let kPublicBn;
    if (BN.isBN(kPublic)) {
        kPublicBn = kPublic;
    } else if (kPublic < 0) {
        kPublicBn = bn128.curve.n.sub(new BN(-kPublic));
    } else {
        kPublicBn = new BN(kPublic);
    }
    proofUtils.parseInputs(notes, sender, m, kPublicBn);

    notes.forEach((note) => {
        rollingHash.append(note.gamma);
        rollingHash.append(note.sigma);
    });

    // define 'running' blinding factor for the k-parameter in final note

    const blindingScalars = joinSplit.generateBlindingScalars(notes.length, m);

    const blindingFactors = joinSplit.constructBlindingFactors(notes, m, rollingHash, blindingScalars);

    const challenge = proofUtils.computeChallenge(sender, kPublicBn, m, notes, blindingFactors);

    const proofData = blindingFactors.map((blindingFactor, i) => {
        let kBar = notes[i].k
            .redMul(challenge)
            .redAdd(blindingFactor.bk)
            .fromRed();
        const aBar = notes[i].a
            .redMul(challenge)
            .redAdd(blindingFactor.ba)
            .fromRed();
        if (i === notes.length - 1) {
            kBar = kPublicBn;
        }
        return [
            `0x${padLeft(kBar.toString(16), 64)}`,
            `0x${padLeft(aBar.toString(16), 64)}`,
            `0x${padLeft(notes[i].gamma.x.fromRed().toString(16), 64)}`,
            `0x${padLeft(notes[i].gamma.y.fromRed().toString(16), 64)}`,
            `0x${padLeft(notes[i].sigma.x.fromRed().toString(16), 64)}`,
            `0x${padLeft(notes[i].sigma.y.fromRed().toString(16), 64)}`,
        ];
    });
    return {
        proofData,
        challenge: `0x${padLeft(challenge.toString(16), 64)}`,
    };
};

/**
 * Construct AZTEC join-split proof transcript. This one rolls `publicOwner` into the hash
 *
 * @method constructJoinSplitModified
 * @memberof module:joinSplit
 * @param {Object[]} notes array of AZTEC notes
 * @param {number} m number of input notes
 * @param {string} sender Ethereum address of transaction sender
 * @param {string} kPublic public commitment being added to proof
 * @param {string} publicOwner address of the public tokens
 * @returns {Object} proof data and challenge
 */
joinSplit.constructJoinSplitModified = (notes, m, sender, kPublic, publicOwner) => {
    // rolling hash is used to combine multiple bilinear pairing comparisons into a single comparison
    const rollingHash = new Keccak();

    let kPublicBn;
    if (BN.isBN(kPublic)) {
        kPublicBn = kPublic;
    } else if (kPublic < 0) {
        kPublicBn = bn128.curve.n.sub(new BN(-kPublic));
    } else {
        kPublicBn = new BN(kPublic);
    }
    proofUtils.parseInputs(notes, sender, m, kPublicBn);

    notes.forEach((note) => {
        rollingHash.append(note.gamma);
        rollingHash.append(note.sigma);
    });

    const blindingScalars = joinSplit.generateBlindingScalars(notes.length, m);

    const blindingFactors = joinSplit.constructBlindingFactors(notes, m, rollingHash, blindingScalars);
    const challenge = proofUtils.computeChallenge(sender, kPublicBn, m, publicOwner, notes, blindingFactors);

    const proofData = blindingFactors.map((blindingFactor, i) => {
        let kBar = notes[i].k
            .redMul(challenge)
            .redAdd(blindingFactor.bk)
            .fromRed();
        const aBar = notes[i].a
            .redMul(challenge)
            .redAdd(blindingFactor.ba)
            .fromRed();
        if (i === notes.length - 1) {
            kBar = kPublicBn;
        }
        return [
            `0x${padLeft(kBar.toString(16), 64)}`,
            `0x${padLeft(aBar.toString(16), 64)}`,
            `0x${padLeft(notes[i].gamma.x.fromRed().toString(16), 64)}`,
            `0x${padLeft(notes[i].gamma.y.fromRed().toString(16), 64)}`,
            `0x${padLeft(notes[i].sigma.x.fromRed().toString(16), 64)}`,
            `0x${padLeft(notes[i].sigma.y.fromRed().toString(16), 64)}`,
        ];
    });
    return {
        proofData,
        challenge: `0x${padLeft(challenge.toString(16), 64)}`,
    };
};

/**
 * Encode a join-split transaction
 *
 * @method encodeJoinSplitTransaction
 * @memberof module:joinSplit
 * @param {Object} values
 * @param {Note[]} inputNotes input AZTEC notes
 * @param {Note[]} outputNotes output AZTEC notes
 * @param {string} senderAddress the Ethereum address sending the AZTEC transaction (not necessarily the note signer)
 * @param {string[]} inputNoteOwners array with the owners of the input notes
 * @param {string} publicOwner address(0x0) or the holder of a public token being converted
 * @param {string} kPublic public commitment being added to proof
 * @param {string} validatorAddress address of the JoinSplit contract
 * @returns {Object} AZTEC proof data and expected output
 */
joinSplit.encodeJoinSplitTransaction = ({
    inputNotes,
    outputNotes,
    senderAddress,
    inputNoteOwners,
    publicOwner,
    kPublic,
    validatorAddress,
}) => {
    const m = inputNotes.length;
    const {
        proofData: proofDataRaw,
        challenge,
    } = joinSplit.constructJoinSplitModified(
        [...inputNotes, ...outputNotes],
        m,
        senderAddress,
        kPublic,
        publicOwner,
    );

    if ((inputNoteOwners.length > 0 && validatorAddress.length === 0)) {
        throw customError(constants.errorTypes.UNABLE_TO_CALCULATE_SIGNATURE, {
            message: 'unable to calculate signatures, as there is no validator address',
            inputNoteOwners,
            validatorAddress,
        })
    }

    const signaturesArray = inputNoteOwners.map((inputNoteOwner, index) => {
        const domain = signer.generateZKAssetDomainParams(validatorAddress);
        const schema = constants.eip712.JOIN_SPLIT_SIGNATURE;

        const message = {
            proof: proofs.JOIN_SPLIT_PROOF,
            noteHash: inputNotes[index].noteHash,
            challenge,
            sender: senderAddress,
        };
        const {
            privateKey,
        } = inputNoteOwner;
        const {
            signature,
        } = signer.signTypedData(domain, schema, message, privateKey);
        const concatenatedSignature = signature[0].slice(2) + signature[1].slice(2) + signature[2].slice(2);
        return concatenatedSignature;
    });
    const signatures = `0x${signaturesArray.join('')}`;

    const outputOwners = outputNotes.map((n) => n.owner);
    const inputOwners = inputNotes.map((n) => n.owner);
    const proofData = inputCoder.joinSplit(proofDataRaw, m, challenge, publicOwner, inputOwners, outputOwners, outputNotes);

    const expectedOutput = `0x${outputCoder
        .encodeProofOutputs([
            {
                inputNotes,
                outputNotes,
                publicOwner,
                publicValue: kPublic,
                challenge,
            },
        ])
        .slice(0x42)}`;
    return {
        proofData,
        expectedOutput,
        signatures
    };
};

/**
 * Generate random blinding scalars, conditional on the AZTEC join-split proof statement
 *   Separated out into a distinct method so that we can stub this for extractor tests
 *
 * @method generateBlindingScalars
 * @memberof module:joinSplit
 * @param {number} n number of notes
 * @param {number} m number of input notes
 */
joinSplit.generateBlindingScalars = (n, m) => {
    let runningBk = new BN(0).toRed(groupReduction);
    const scalars = [...Array(n)].map((v, i) => {
        let bk = bn128.randomGroupScalar();
        const ba = bn128.randomGroupScalar();
        if (i === n - 1) {
            if (n === m) {
                bk = new BN(0).toRed(groupReduction).redSub(runningBk);
            } else {
                bk = runningBk;
            }
        }

        if (i + 1 > m) {
            runningBk = runningBk.redSub(bk);
        } else {
            runningBk = runningBk.redAdd(bk);
        }
        return {
            bk,
            ba
        };
    });
    return scalars;
};

module.exports = joinSplit;
