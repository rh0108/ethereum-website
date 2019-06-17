const { errors } = require('@aztec/dev-utils');
const { expect } = require('chai');
const sinon = require('sinon');
const { padLeft, padRight, randomHex } = require('web3-utils');

const bn128 = require('../../../src/bn128');
const { mockNoteSet, randomNoteValue } = require('../../helpers/note');
const { mockZeroSwapProof } = require('../../helpers/proof');
const { Proof, SwapProof } = require('../../../src/proof');
const SwapVerifier = require('../../../src/proof/swap/verifier');

describe('Swap Proof Verifier', () => {
    const sender = randomHex(20);

    describe('Success States', () => {
        it('should verify a valid Swap proof', async () => {
            const kIn = [10, 20];
            const kOut = [10, 20];
            const { inputNotes, outputNotes } = await mockNoteSet(kIn, kOut);
            const proof = new SwapProof(inputNotes, outputNotes, sender);

            const verifier = new SwapVerifier(proof);
            verifier.verifyProof();
            expect(verifier.isValid).to.equal(true);
            expect(verifier.errors.length).to.equal(0);
        });
    });

    describe('Failure States', () => {
        let validateInputsStub;

        before(() => {
            validateInputsStub = sinon.stub(Proof.prototype, 'validateInputs').callsFake(() => {});
        });

        after(() => {
            validateInputsStub.restore();
        });

        it('should reject if notes do NOT balance', async () => {
            const kIn = [10, 19];
            const kOut = [10, 20];
            const { inputNotes, outputNotes } = await mockNoteSet(kIn, kOut);
            const proof = new SwapProof(inputNotes, outputNotes, sender);

            const verifier = new SwapVerifier(proof);
            verifier.verifyProof();
            expect(verifier.isValid).to.equal(false);
            expect(verifier.errors.length).to.equal(1);
            expect(verifier.errors[0]).to.equal(errors.codes.CHALLENGE_RESPONSE_FAIL);
        });

        it('should reject if random note values', async () => {
            const kIn = Array(2)
                .fill()
                .map(() => randomNoteValue());
            const kOut = Array(2)
                .fill()
                .map(() => randomNoteValue());
            const { inputNotes, outputNotes } = await mockNoteSet(kIn, kOut);
            const proof = new SwapProof(inputNotes, outputNotes, sender);

            const verifier = new SwapVerifier(proof);
            verifier.verifyProof();
            expect(verifier.isValid).to.equal(false);
            expect(verifier.errors.length).to.equal(1);
            expect(verifier.errors[0]).to.equal(errors.codes.CHALLENGE_RESPONSE_FAIL);
        });

        it('should reject if malformed challenge', async () => {
            const kIn = [10, 20];
            const kOut = [10, 20];
            const { inputNotes, outputNotes } = await mockNoteSet(kIn, kOut);
            const proof = new SwapProof(inputNotes, outputNotes, sender);

            const bogusChallengeHex = randomHex(31);
            sinon.stub(proof, 'challengeHex').get(() => bogusChallengeHex);

            const verifier = new SwapVerifier(proof);
            verifier.verifyProof();
            expect(verifier.isValid).to.equal(false);
            expect(verifier.errors.length).to.equal(1);
            expect(verifier.errors[0]).to.equal(errors.codes.CHALLENGE_RESPONSE_FAIL);
        });

        it('should reject if random proof data', async () => {
            const kIn = [10, 20];
            const kOut = [10, 20];
            const { inputNotes, outputNotes } = await mockNoteSet(kIn, kOut);
            const proof = new SwapProof(inputNotes, outputNotes, sender);

            proof.data = Array(4)
                .fill()
                .map(() =>
                    Array(6)
                        .fill()
                        .map(() => randomHex(64)),
                );

            const verifier = new SwapVerifier(proof);
            verifier.verifyProof();
            expect(verifier.isValid).to.equal(false);
            expect(verifier.errors).to.contain(errors.codes.CHALLENGE_RESPONSE_FAIL);
        });

        it('should reject if blinding factor at infinity', async () => {
            const kIn = [10, 20];
            const kOut = [10, 20];
            const { inputNotes, outputNotes } = await mockNoteSet(kIn, kOut);
            const proof = new SwapProof(inputNotes, outputNotes, sender);

            proof.data[0][0] = `0x${padLeft('05', 64)}`;
            proof.data[0][1] = `0x${padLeft('05', 64)}`;
            proof.data[0][2] = `0x${padLeft(bn128.h.x.fromRed().toString(16), 64)}`;
            proof.data[0][3] = `0x${padLeft(bn128.h.y.fromRed().toString(16), 64)}`;
            proof.data[0][4] = `0x${padLeft(bn128.h.x.fromRed().toString(16), 64)}`;
            proof.data[0][5] = `0x${padLeft(bn128.h.y.fromRed().toString(16), 64)}`;

            const bogusChallengeHex = `0x${padLeft('0a', 64)}`;
            sinon.stub(proof, 'challengeHex').get(() => bogusChallengeHex);

            const verifier = new SwapVerifier(proof);
            verifier.verifyProof();
            expect(verifier.isValid).to.equal(false);
            expect(verifier.errors.length).to.equal(2);
            expect(verifier.errors[0]).to.equal(errors.codes.BAD_BLINDING_FACTOR);
            expect(verifier.errors[1]).to.equal(errors.codes.CHALLENGE_RESPONSE_FAIL);
        });

        it('should reject if blinding factor computed from scalars that are zero', async () => {
            const kIn = [10, 20];
            const kOut = [10, 20];
            const { inputNotes, outputNotes } = await mockNoteSet(kIn, kOut);
            const proof = new SwapProof(inputNotes, outputNotes, sender);

            proof.data[0][0] = `0x${padLeft('0', 64)}`; // kBar
            proof.data[0][1] = `0x${padLeft('0', 64)}`; // aBar

            const verifier = new SwapVerifier(proof);
            verifier.verifyProof();
            expect(verifier.isValid).to.equal(false);
            expect(verifier.errors.length).to.equal(3);
            expect(verifier.errors[0]).to.equal(errors.codes.SCALAR_IS_ZERO);
            expect(verifier.errors[1]).to.equal(errors.codes.SCALAR_IS_ZERO);
            expect(verifier.errors[2]).to.equal(errors.codes.CHALLENGE_RESPONSE_FAIL);
        });

        it('should reject if blinding factor computed from points NOT on the curve', async () => {
            // We can construct 'proof' where all points and scalars are zero. The challenge response
            // is correctly reconstructed, but the proof should still be invalid
            const zeroProof = mockZeroSwapProof();

            // Make the kBars satisfy the proof relation, to ensure it's not an incorrect balancing
            // relationship that causes the test to fail
            zeroProof.data[0][0] = padRight('0x1', 64); // k_1
            zeroProof.data[1][0] = padRight('0x2', 64); // k_2
            zeroProof.data[2][0] = padRight('0x1', 64); // k_3
            zeroProof.data[3][0] = padRight('0x2', 64); // k_4
            // Set aBars to arbitrarily chosen values, to ensure it's not failing due to aBar = 0
            zeroProof.data[0][1] = padRight('0x4', 64); // a_1
            zeroProof.data[1][1] = padRight('0x5', 64); // a_2
            zeroProof.data[2][1] = padRight('0x6', 64); // a_3
            zeroProof.data[3][1] = padRight('0x7', 64); // a_4

            const verifier = new SwapVerifier(zeroProof);
            verifier.verifyProof();
            expect(verifier.isValid).to.equal(false);
            expect(verifier.errors.length).to.equal(13);
            expect(verifier.errors[0]).to.equal(errors.codes.SCALAR_TOO_BIG);
            expect(verifier.errors[1]).to.equal(errors.codes.NOT_ON_CURVE);
            expect(verifier.errors[2]).to.equal(errors.codes.NOT_ON_CURVE);
            expect(verifier.errors[3]).to.equal(errors.codes.SCALAR_TOO_BIG);
            expect(verifier.errors[4]).to.equal(errors.codes.NOT_ON_CURVE);
            expect(verifier.errors[5]).to.equal(errors.codes.NOT_ON_CURVE);
            expect(verifier.errors[6]).to.equal(errors.codes.SCALAR_TOO_BIG);
            expect(verifier.errors[7]).to.equal(errors.codes.NOT_ON_CURVE);
            expect(verifier.errors[8]).to.equal(errors.codes.NOT_ON_CURVE);
            expect(verifier.errors[9]).to.equal(errors.codes.SCALAR_TOO_BIG);
            expect(verifier.errors[10]).to.equal(errors.codes.NOT_ON_CURVE);
            expect(verifier.errors[11]).to.equal(errors.codes.NOT_ON_CURVE);
            expect(verifier.errors[12]).to.equal(errors.codes.CHALLENGE_RESPONSE_FAIL);
        });
    });
});
