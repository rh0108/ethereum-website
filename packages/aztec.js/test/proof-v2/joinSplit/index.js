/* eslint-disable prefer-destructuring */
const { constants, errors } = require('@aztec/dev-utils');
const BN = require('bn.js');
const { expect } = require('chai');
const { randomHex } = require('web3-utils');

const bn128 = require('../../../src/bn128');
const { JoinSplitProof } = require('../../../src/proof-v2');
const { mockNoteSet, randomNoteValue } = require('../../helpers/note');
const ProofUtils = require('../../../src/proof-v2/utils');
const { validateElement, validateScalar } = require('../../helpers/bn128');

describe.only('Join-Split Proof', () => {
    let inputNotes;
    let kIn;
    let kOut;
    let outputNotes;
    let publicOwner;
    let sender;

    before(() => {
        kIn = [...Array(2)].map(() => randomNoteValue());
        kOut = [...Array(3)].map(() => randomNoteValue());
        publicOwner = randomHex(20);
        sender = randomHex(20);
    });

    beforeEach(async () => {
        const notes = await mockNoteSet(kIn, kOut);
        inputNotes = notes.inputNotes;
        outputNotes = notes.outputNotes;
    });

    it('should construct a Join-Split proof with well-formed outputs', async () => {
        let publicValue = ProofUtils.getPublicValue(kIn, kOut);
        publicValue = bn128.curve.n.add(new BN(publicValue)).umod(bn128.curve.n);
        const proof = new JoinSplitProof(inputNotes, outputNotes, sender, publicValue, publicOwner);

        expect(proof.data.length).to.equal(5);
        expect(proof.challengeHex.length).to.equal(66);
        validateScalar(proof.challengeHex);

        const dataLength = proof.data.length;
        proof.data.forEach((note, i) => {
            validateScalar(note[0], i === dataLength - 1);
            validateScalar(note[1]);
            validateElement(note[2], note[3]);
            validateElement(note[4], note[5]);
        });
        const lastNote = proof.data[dataLength - 1];
        expect(new BN(lastNote[0].slice(2), 16).eq(publicValue)).to.equal(true);
    });

    it('should fail to construct a Join-Split proof with malformed publicValue', async () => {
        const publicValue = bn128.curve.n.add(new BN(100));
        try {
            const _ = new JoinSplitProof(inputNotes, outputNotes, sender, publicValue, publicOwner);
        } catch (err) {
            expect(err.message).to.equal(errors.codes.KPUBLIC_MALFORMED);
        }
    });

    it('should fail to construct a Join-Split proof if point NOT on curve', async () => {
        const publicValue = ProofUtils.getPublicValue(kIn, kOut);
        inputNotes[0].gamma.x = new BN(bn128.curve.p.add(new BN(100))).toRed(bn128.curve.red);
        try {
            const _ = new JoinSplitProof(inputNotes, outputNotes, sender, publicValue, publicOwner);
        } catch (err) {
            expect(err.message).to.equal(errors.codes.NOT_ON_CURVE);
        }
    });

    it('should fail to construct a Join-Split proof for the point at infinity', async () => {
        const publicValue = ProofUtils.getPublicValue(kIn, kOut);
        inputNotes[0].gamma = inputNotes[0].gamma.add(inputNotes[0].gamma.neg());
        try {
            const _ = new JoinSplitProof(inputNotes, outputNotes, sender, publicValue, publicOwner);
        } catch (err) {
            expect(err.message).to.equal(errors.codes.POINT_AT_INFINITY);
        }
    });

    it('should fail to construct a Join-Split proof if viewing key response is 0', async () => {
        const publicValue = ProofUtils.getPublicValue(kIn, kOut);
        inputNotes[0].a = new BN(0).toRed(bn128.groupReduction);
        try {
            const _ = new JoinSplitProof(inputNotes, outputNotes, sender, publicValue, publicOwner);
        } catch (err) {
            expect(err.message).to.equal(errors.codes.VIEWING_KEY_MALFORMED);
        }
    });

    it('should fail to construct a Join-Split proof if value > K_MAX', async () => {
        const publicValue = ProofUtils.getPublicValue(kIn, kOut);
        inputNotes[0].k = new BN(constants.K_MAX + 1).toRed(bn128.groupReduction);
        try {
            const _ = new JoinSplitProof(inputNotes, outputNotes, sender, publicValue, publicOwner);
        } catch (err) {
            expect(err.message).to.equal(errors.codes.NOTE_VALUE_TOO_BIG);
        }
    });
});
