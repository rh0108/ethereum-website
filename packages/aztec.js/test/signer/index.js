const bn128 = require('@aztec/bn128');
const { constants, proofs } = require('@aztec/dev-utils');
const secp256k1 = require('@aztec/secp256k1');
const typedData = require('@aztec/typed-data');
const BN = require('bn.js');
const { expect } = require('chai');
const ethSigUtil = require('eth-sig-util');
const ethUtil = require('ethereumjs-util');
const { keccak256, padLeft, randomHex } = require('web3-utils');

const note = require('../../src/note');
const signer = require('../../src/signer');

describe('Signer', () => {
    let accounts;
    const domainTypes = {
        EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'verifyingContract', type: 'address' },
        ],
    };

    beforeEach(() => {
        accounts = [secp256k1.generateAccount(), secp256k1.generateAccount()];
    });

    it('should generate correct AZTEC domain params', () => {
        expect(signer.generateACEDomainParams('0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC')).to.deep.equal({
            name: 'AZTEC_CRYPTOGRAPHY_ENGINE',
            version: '1',
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        });
    });

    it('should have the domain params resolve to expected message', () => {
        const messageInput = signer.generateACEDomainParams('0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC');
        const result = typedData.encodeMessageData(domainTypes, 'EIP712Domain', messageInput);
        const messageData = [
            keccak256('EIP712Domain(string name,string version,address verifyingContract)').slice(2),
            keccak256('AZTEC_CRYPTOGRAPHY_ENGINE').slice(2),
            keccak256('1').slice(2),
            padLeft('cccccccccccccccccccccccccccccccccccccccc', 64),
        ];
        const expected = messageData.join('');
        expect(result).to.equal(expected);
    });

    describe('Join Split Signature', () => {
        it('should output a well formed signature', () => {
            const verifyingContract = randomHex(20);
            const noteString = Array(4)
                .fill()
                .map(() => randomHex(32));
            const senderAddress = randomHex(20);
            const challengeString = `${senderAddress}${padLeft('132', 64)}${padLeft('1', 64)}${[...noteString]}`;
            const challenge = `0x${new BN(keccak256(challengeString, 'hex').slice(2), 16).umod(bn128.curve.n).toString(16)}`;

            const domain = signer.generateACEDomainParams(verifyingContract, constants.eip712.ACE_DOMAIN_PARAMS);
            const schema = constants.eip712.JOIN_SPLIT_SIGNATURE;
            const message = {
                proof: proofs.JOIN_SPLIT_PROOF,
                noteHash: randomHex(32),
                challenge,
                sender: senderAddress,
            };
            const { privateKey } = accounts[0];
            const { signature } = signer.signTypedData(domain, schema, message, privateKey);

            const expectedLength = 3;
            const expectedNumCharacters = 64; // v, r and s should be 32 bytes

            expect(signature.length).to.equal(expectedLength);
            expect(signature[0].length - 2).to.equal(expectedNumCharacters);
            expect(signature[1].length - 2).to.equal(expectedNumCharacters);
            expect(signature[2].length - 2).to.equal(expectedNumCharacters);
        });

        it('should recover public key from signature params', () => {
            const verifyingContract = randomHex(20);
            const noteString = Array(4)
                .fill()
                .map(() => randomHex(32));
            const senderAddress = randomHex(20);
            const challengeString = `${senderAddress}${padLeft('132', 64)}${padLeft('1', 64)}${[...noteString]}`;
            const challenge = `0x${new BN(keccak256(challengeString, 'hex').slice(2), 16).umod(bn128.curve.n).toString(16)}`;

            const domain = signer.generateACEDomainParams(verifyingContract, constants.eip712.ACE_DOMAIN_PARAMS);
            const schema = constants.eip712.JOIN_SPLIT_SIGNATURE;
            const message = {
                proof: proofs.JOIN_SPLIT_PROOF,
                noteHash: randomHex(32),
                challenge,
                sender: senderAddress,
            };
            const { privateKey, publicKey } = accounts[0];
            const { signature, encodedTypedData } = signer.signTypedData(domain, schema, message, privateKey);
            const messageHash = Buffer.from(encodedTypedData.slice(2), 'hex');

            const v = parseInt(signature[0], 16); // has to be in number format
            const r = Buffer.from(signature[1].slice(2), 'hex');
            const s = Buffer.from(signature[2].slice(2), 'hex');

            const publicKeyRecover = ethUtil.ecrecover(messageHash, v, r, s).toString('hex');
            expect(publicKeyRecover).to.equal(publicKey.slice(4));
        });

        it('signNoteForConfidentialApprove() should produce a well formed `v` ECDSA parameter', async () => {
            const { publicKey, privateKey } = secp256k1.generateAccount();
            const spender = randomHex(20);
            const verifyingContract = randomHex(20);
            const testNoteValue = 10;
            const testNote = await note.create(publicKey, testNoteValue);

            const signature = signer.signNoteForConfidentialApprove(
                verifyingContract,
                testNote.noteHash,
                spender,
                privateKey,
            );
            const v = parseInt(signature.slice(130, 132), 16);
            expect(v).to.be.oneOf([27, 28]);
        });

        it('should recover publicKey from signature params', async () => {
            const { publicKey, privateKey } = secp256k1.generateAccount();
            const spender = randomHex(20);
            const verifyingContract = randomHex(20);
            const testNoteValue = 10;
            const testNote = await note.create(publicKey, testNoteValue);

            const signature = signer.signNoteForConfidentialApprove(
                verifyingContract,
                testNote.noteHash,
                spender,
                privateKey,
            );

            const r = Buffer.from(signature.slice(2, 66), 'hex');
            const s = Buffer.from(signature.slice(66, 130), 'hex');
            const v = parseInt(signature.slice(130, 132), 16);

            const domain = signer.generateZKAssetDomainParams(verifyingContract);
            const schema = constants.eip712.NOTE_SIGNATURE;
            const message = {
                noteHash: testNote.noteHash,
                spender,
                status: true,
            };
            const { encodedTypedData } = signer.signTypedData(domain, schema, message, privateKey);
            const messageHash = Buffer.from(encodedTypedData.slice(2), 'hex');

            const publicKeyRecover = ethUtil.ecrecover(messageHash, v, r, s).toString('hex');
            expect(publicKeyRecover).to.equal(publicKey.slice(4));
        });

        it('signNoteForConfidentialApprove() should produce same signature as MetaMask signing function', async () => {
            const aztecAccount = secp256k1.generateAccount();
            const spender = randomHex(20);
            const verifyingContract = randomHex(20);
            const testNoteValue = 10;
            const testNote = await note.create(aztecAccount.publicKey, testNoteValue);

            const metaMaskTypedData = {
                domain: {
                    name: 'ZK_ASSET',
                    version: '1',
                    verifyingContract,
                },
                types: {
                    NoteSignature: [
                        { name: 'noteHash', type: 'bytes32' },
                        { name: 'spender', type: 'address' },
                        { name: 'status', type: 'bool' },
                    ],
                    EIP712Domain: [
                        { name: 'name', type: 'string' },
                        { name: 'version', type: 'string' },
                        { name: 'verifyingContract', type: 'address' },
                    ],
                },
                primaryType: 'NoteSignature',
                message: {
                    noteHash: testNote.noteHash,
                    spender,
                    status: true,
                },
            };

            const aztecSignature = signer.signNoteForConfidentialApprove(
                verifyingContract,
                testNote.noteHash,
                spender,
                aztecAccount.privateKey,
            );
            const metaMaskSignature = ethSigUtil.signTypedData(Buffer.from(aztecAccount.privateKey.slice(2), 'hex'), {
                data: metaMaskTypedData,
            });
            expect(aztecSignature).to.equal(metaMaskSignature);
        });
    });
});
