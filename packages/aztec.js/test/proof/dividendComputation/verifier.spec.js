/* global, beforeEach, it:true */
const { constants: { K_MAX } } = require('@aztec/dev-utils');
const BN = require('bn.js');
const chai = require('chai');
const { padLeft, sha3 } = require('web3-utils');
const crypto = require('crypto');


const bn128 = require('../../../src/bn128');
const dividendComputation = require('../../../src/proof/dividendComputation');

const { expect } = chai;

function randomAddress() {
    return `0x${padLeft(crypto.randomBytes(20).toString('hex'), 64)}`;
}

describe('Dividend computation verifier tests', () => {
    describe('success states', () => {
        let testNotes;
        let sender;
        let za;
        let zb;

        beforeEach(() => {
            /*
            Test case:
            - k_in = 90
            - Interest rate = 5%
            - k_out = 4
            - k_res = 5
            - za = 5
            - zb = 100
            */

            testNotes = dividendComputation.helpers.makeTestNotes([90], [4, 50]);
            za = 100;
            zb = 5;

            // Dummy, random sender address for proof of concept
            sender = randomAddress();
        });

        it('dividendComputation.constructProof creates a valid dividend computation proof', () => {
            const { proofDataUnformatted, challenge } = dividendComputation.constructProof(testNotes, za, zb, sender);
            const result = dividendComputation.verifier.verifyProof(proofDataUnformatted, challenge, sender, za, zb);
            expect(result).to.equal(true);
        });
    });


    describe('failure states', () => {
        let testNotes;
        let sender;
        let za;
        let zb;

        beforeEach(() => {
            /*
            Test case:
            - k_in = 90
            - Interest rate = 5%
            - k_out = 4
            - k_res = 5
            - za = 5
            - zb = 100
            */

            testNotes = dividendComputation.helpers.makeTestNotes([90], [4, 50]);
            za = 100;
            zb = 5;

            // Dummy, random sender address for proof of concept
            sender = randomAddress();
        });

        it('will REJECT for incorrect number of input notes', () => {
            const tooManyNotes = dividendComputation.helpers.makeTestNotes([90, 1], [4, 50]);

            let message = '';
            try {
                dividendComputation.constructProof(tooManyNotes, za, zb, sender);
            } catch (err) {
                ({ message } = err);
            }
            expect(message).to.equal('incorrect number of notes');
        });

        it('will REJECT for unsatisfied proof relations', () => {
            const wrongRelationship = dividendComputation.helpers.makeTestNotes([90], [4, 49]);
            const { proofDataUnformatted, challenge } = dividendComputation.constructProof(wrongRelationship, za, zb, sender);

            let message = '';

            try {
                dividendComputation.verifier.verifyProof(proofDataUnformatted, challenge, sender, za, zb);
            } catch (err) {
                ({ message } = err);
            }
            expect(message).to.equal('proof validation failed');
        });

        it('will REJECT for fake challenge', () => {
            const { proofDataUnformatted } = dividendComputation.constructProof(testNotes, za, zb, sender);

            const zeroes = `${padLeft('0', 64)}`;
            const noteString = [...Array(6)].reduce(acc => `${acc}${zeroes}`, '');
            const challengeString = `${sender}${padLeft('132', 64)}${padLeft('1', 64)}${noteString}`;
            const fakeChallenge = `0x${new BN(sha3(challengeString, 'hex').slice(2), 16).umod(bn128.curve.n).toString(16)}`;

            let message = '';

            try {
                dividendComputation.verifier.verifyProof(proofDataUnformatted, fakeChallenge, sender, za, zb);
            } catch (err) {
                ({ message } = err);
            }
            expect(message).to.equal('proof validation failed');
        });

        it('will REJECT for fake proof data', () => {
            const { challenge } = dividendComputation.constructProof(testNotes, za, zb, sender);

            const fakeProofData = [...Array(3)]
                .map(() => [...Array(6)]
                    .map(() => `0x${padLeft(crypto.randomBytes(32).toString('hex'), 64)}`));

            let message = '';

            try {
                dividendComputation.verifier.verifyProof(fakeProofData, challenge, sender, za, zb);
            } catch (err) {
                ({ message } = err);
            }
            expect(message).to.equal('point not on curve');
        });


        it('will REJECT for z_a > k_max', () => {
            const zaLarge = K_MAX + za;
            const { proofDataUnformatted, challenge } = dividendComputation.constructProof(testNotes, zaLarge, zb, sender);

            let message = '';

            try {
                dividendComputation.verifier.verifyProof(proofDataUnformatted, challenge, sender, zaLarge, zb);
            } catch (err) {
                ({ message } = err);
            }
            expect(message).to.equal('z_a is greater than or equal to kMax');
        });

        it('will REJECT for z_b > k_max', () => {
            const zbLarge = K_MAX + zb;
            const { proofDataUnformatted, challenge } = dividendComputation.constructProof(testNotes, za, zbLarge, sender);
            let message = '';

            try {
                dividendComputation.verifier.verifyProof(proofDataUnformatted, challenge, sender, za, zbLarge);
            } catch (err) {
                ({ message } = err);
            }
            expect(message).to.equal('z_b is greater than or equal to kMax');
        });

        it('will REJECT if point not on the curve', () => {
            const { proofDataUnformatted, challenge } = dividendComputation.constructProof(testNotes, za, zb, sender);

            // Setting the x coordiante of gamma to zero
            proofDataUnformatted[0][2] = '0x0000000000000000000000000000000000000000000000000000000000000000';

            let message = '';
            try {
                dividendComputation.verifier.verifyProof(proofDataUnformatted, challenge, sender, za, zb);
            } catch (err) {
                ({ message } = err);
            }
            expect(message).to.equal('point not on curve');
        });

        it('will REJECT if blinding factor at infinity', () => {
            const { proofDataUnformatted, challenge } = dividendComputation.constructProof(testNotes, za, zb, sender);
            proofDataUnformatted[0][0] = `0x${padLeft('05', 64)}`;
            proofDataUnformatted[0][1] = `0x${padLeft('05', 64)}`;
            proofDataUnformatted[0][2] = `0x${padLeft(bn128.h.x.fromRed().toString(16), 64)}`;
            proofDataUnformatted[0][3] = `0x${padLeft(bn128.h.y.fromRed().toString(16), 64)}`;
            proofDataUnformatted[0][4] = `0x${padLeft(bn128.h.x.fromRed().toString(16), 64)}`;
            proofDataUnformatted[0][5] = `0x${padLeft(bn128.h.y.fromRed().toString(16), 64)}`;

            let message = '';
            try {
                dividendComputation.verifier.verifyProof(proofDataUnformatted, challenge, sender, za, zb);
            } catch (err) {
                ({ message } = err);
            }
            expect(message).to.equal('proof validation failed');
        });

        it('will REJECT if blinding factor computed from invalid point', () => {
            const { proofDataUnformatted, challenge } = dividendComputation.constructProof(testNotes, za, zb, sender);
            proofDataUnformatted[0][0] = `0x${padLeft('', 64)}`;
            proofDataUnformatted[0][1] = `0x${padLeft('', 64)}`;
            proofDataUnformatted[0][2] = `0x${padLeft('', 64)}`;
            proofDataUnformatted[0][3] = `0x${padLeft('', 64)}`;
            proofDataUnformatted[0][4] = `0x${padLeft('', 64)}`;
            proofDataUnformatted[0][5] = `0x${padLeft('', 64)}`;

            let message = '';
            try {
                dividendComputation.verifier.verifyProof(proofDataUnformatted, challenge, sender, za, zb);
            } catch (err) {
                ({ message } = err);
            }
            expect(message).to.equal('point not on curve');
        });
    });
});
