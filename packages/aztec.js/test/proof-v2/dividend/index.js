/* global, beforeEach, it:true */
const secp256k1 = require('@aztec/secp256k1');
const { expect } = require('chai');
const { randomHex } = require('web3-utils');

const { DividendProof } = require('../../../src/proof-v2');
const note = require('../../../src/note');

describe.only('Dividend Proof', () => {
    let notionalNote = {};
    const notionalNoteValue = 90;
    const { publicKey } = secp256k1.generateAccount();
    let residualNote = {};
    const residualNoteValue = 4;
    const sender = randomHex(20);
    let targetNote = {};
    const targetNoteValue = 50;
    const za = 100;
    const zb = 5;

    before(async () => {
        notionalNote = await note.create(publicKey, notionalNoteValue);
        targetNote = await note.create(publicKey, targetNoteValue);
        residualNote = await note.create(publicKey, residualNoteValue);
    });

    /**
     * In this test case, the interest rate if 5% (as `za` is 100 and `zb` is 5)
     */
    it('should construct a Dividend proof with well-formed outputs', async () => {
        const proof = new DividendProof(notionalNote, targetNote, residualNote, sender, za, zb);

        expect(proof.data.length).to.equal(3);
        expect(proof.challengeHex.length).to.equal(66);
        expect(proof.data[0].length).to.equal(6);
        expect(proof.data[1].length).to.equal(6);
        expect(proof.data[2].length).to.equal(6);
    });
});
