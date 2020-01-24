/**
 * Module to ECDSA signatures over structured data,
 *   following the [EIP712]{@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md} standard
 *
 * @module signer
 */

import { constants, proofs } from '@aztec/dev-utils';

import secp256k1 from '@aztec/secp256k1';
import typedData from '@aztec/typed-data';
import { randomHex, padRight, keccak256 } from 'web3-utils';

const signer = {};

/**
 * Generate EIP712 domain parameters for ACE.sol
 * @method generateACEDomainParams
 * @param {string} verifyingContract address of target contract
 * @returns {Object} EIP712 Domain type object
 */
signer.generateACEDomainParams = (verifyingContract, domain = constants.eip712.ACE_DOMAIN_PARAMS) => {
    return {
        name: domain.name,
        version: domain.version,
        verifyingContract,
    };
};

/**
 * Generate EIP712 domain parameters for AccountRegistryBehaviour.sol
 * @param {string} verifyingContract - address of target contract
 * @returns {Object} EIP712 domain type object
 */
signer.generateAccountRegistryDomainParams = (verifyingContract, domain = constants.eip712.ACCOUNT_REGISTRY_DOMAIN_PARAMS) => {
    return {
        name: domain.name,
        version: domain.version,
        verifyingContract,
    };
};

/**
 * Generate EIP712 domain parameters for ZkAsset.sol
 * @method generateZKAssetDomainParams
 * @param {string} verifyingContract address of target contract
 * @returns {Object} EIP712 Domain type object
 */
signer.generateZKAssetDomainParams = (verifyingContract) => {
    return {
        ...constants.eip712.ZK_ASSET_DOMAIN_PARAMS,
        verifyingContract,
    };
};

/**
 * Create an EIP712 ECDSA signature over an AZTEC note, suited for the confidentialApprove() method of a
 * ZkAsset. The ZkAsset.confidentialApprove() method must be called when granting note spending permission
 * to a third party and is required in order for ZkAsset.confidentialTransferFrom() to be successful.
 *
 * This is expected to be the most commonly used note signing() function. However for use cases, such as
 * testing, where ACE domain params are required then the signNoteACEDomain() function is
 * available.
 *
 * Formats `r` and `s` as occupying 32 bytes, and `v` as occupying 1 byte
 * @method signNoteForConfidentialApprove
 * @param {string} verifyingContract address of target contract
 * @param {string} noteHash noteHash of the note being signed
 * @param {string} spender address of the note spender
 * @param {bool} spenderApproval boolean determining whether the spender is being granted approval
 * or revoked
 * @param {string} privateKey the private key of message signer
 * @returns {string} ECDSA signature parameters [r, s, v], formatted as 32-byte wide hex-strings
 */
signer.signNoteForConfidentialApprove = (verifyingContract, noteHash, spender, spenderApproval, privateKey) => {
    const domain = signer.generateZKAssetDomainParams(verifyingContract);
    const schema = constants.eip712.NOTE_SIGNATURE;
    const message = {
        noteHash,
        spender,
        spenderApproval,
    };

    const { unformattedSignature } = signer.signTypedData(domain, schema, message, privateKey);
    const signature = `0x${unformattedSignature.slice(0, 130)}`; // extract r, s, v (v is just 1 byte, 2 characters)
    return signature;
};

/**
 * Create an EIP712 ECDSA signature over an AZTEC proof, used to either grant or revoke delegation of proof execution
 * to a third party using the approveProof() method of a ZkAsset.
 *
 * ECSA signature is formatted as follows:
 * - `r` and `s` occupy 32 bytes
 * - `v` occupies 1 byte
 *
 * @method signApprovalForProof
 * @param {string} verifyingContract address of target contract
 * @param {string} proofOutputs outputs of a proof
 * @param {string} spender address to which note control is being delegated
 * @param {bool} approval boolean (true for approval, false for revocation)
 * @param {string} privateKey the private key of message signer
 * @returns {string} ECDSA signature parameters [r, s, v], formatted as 32-byte wide hex-strings
 */
signer.signApprovalForProof = (verifyingContract, proofOutputs, spender, approval, privateKey) => {
    const domain = signer.generateZKAssetDomainParams(verifyingContract);
    const schema = constants.eip712.PROOF_SIGNATURE;
    const proofHash = keccak256(proofOutputs);

    const message = {
        proofHash,
        spender,
        approval,
    };
    const { unformattedSignature } = signer.signTypedData(domain, schema, message, privateKey);
    const signature = `0x${unformattedSignature.slice(0, 130)}`; // extract r, s, v (v is just 1 byte, 2 characters)
    return signature;
};

/**
 * Construct EIP712 ECDSA signatures over an array of notes for use in calling confidentialTransfer()
 *
 * @method signNotesForConfidentialTransfer
 * @param {string} verifyingContract address of target contract
 * @param {Object[]} noteOwnerAccounts Ethereum accounts of the owners of the notes over which signatures are being created.
 * Included in each account is: address, publicKey, privateKey
 * @param {Object[]} notes array of notes over which signatures are being constructed
 * @param {string} challenge cryptographic challenge, unique identifier for a proof
 * @param {string} spender address of the note spender
 * @returns {string} string of ECDSA signature parameters [r, s, v] for all notes. There is one set of signature params
 * for each note, and they are all concatenated together
 */
signer.signMultipleNotesForConfidentialTransfer = (verifyingContract, noteOwnerAccounts, notes, challenge, sender) => {
    const signaturesArray = noteOwnerAccounts.map((inputNoteOwner, index) => {
        return signer.signNoteForConfidentialTransfer(
            verifyingContract,
            inputNoteOwner,
            notes[index].noteHash,
            challenge,
            sender,
        );
    });
    return `0x${signaturesArray.join('')}`;
};

/**
 * Create an EIP712 ECDSA signature over an AZTEC note, to be used to give permission for
 * note expenditure during a zkAsset confidentialTransfer() method call.
 *
 * Uses the default format of `r`, `s` and `v` as occupying 32 bytes
 *
 * @method signNoteForConfidentialTransfer
 * @param {string} verifyingContract address of target contract
 * @param {string} noteOwnerAccount Ethereum account (privateKey, publicKey and address) of owner of the note
 * being signed
 * @param {string} noteHash hash of the note being signed
 * @param {string} challenge hexadecimal representation of the challenge variable
 * @param {string} sender address of the transaction sender
 * @returns {string} ECDSA signature parameters [r, s, v]
 */
signer.signNoteForConfidentialTransfer = (verifyingContract, noteOwnerAccount, noteHash, challenge, sender) => {
    const domain = signer.generateZKAssetDomainParams(verifyingContract);
    const schema = constants.eip712.JOIN_SPLIT_SIGNATURE;
    const message = {
        proof: proofs.JOIN_SPLIT_PROOF,
        noteHash,
        challenge,
        sender,
    };

    const { privateKey } = noteOwnerAccount;
    const { unformattedSignature } = signer.signTypedData(domain, schema, message, privateKey);
    return unformattedSignature;
};

/**
 * Create an EIP712 ECDSA signature over an AZTEC note, for an ACE.sol domain.
 *
 * Formats `r` and `s` as occupying 32 bytes, and `v` as occupying 1 byte
 * @method signNoteACEDomain
 * @param {string} verifyingContract address of target contract
 * @param {string} spender address of the note spender
 * @param {string} privateKey the private key of message signer
 * @returns {string[]} ECDSA signature parameters, [r, s, v], formatted as 32-byte wide hex-strings
 */

signer.signNoteACEDomain = (verifyingContract, spender, privateKey) => {
    const domain = signer.generateACEDomainParams(verifyingContract, constants.eip712.ACE_DOMAIN_PARAMS);
    const schema = constants.eip712.NOTE_SIGNATURE;
    const status = true;

    const message = {
        noteHash: randomHex(32),
        spender,
        status,
    };

    const { unformattedSignature, encodedTypedData } = signer.signTypedData(domain, schema, message, privateKey);
    const signature = `0x${unformattedSignature.slice(0, 130)}`; // extract r, s, v (v is just 1 byte, 2 characters)
    return { signature, encodedTypedData };
};

/**
 * Create an EIP712 ECDSA signature over structured data. This is a low level function that returns the signature parameters
 * in an unstructured form - `r`, `s` and `v` are all 32 bytes in size.
 *
 * Higher level functions such as
 * signNoteForConfidentialApprove() and signNotesForConfidentialTransfer() will then format the signature params as required
 * by the relevant verification procedure.
 *
 * @method signTypedData
 * @param {string} schema JSON object that defines the structured data of the signature
 * @param {string[]} domain variables required for the domain hash part of the signature
 * @param {string} message the Ethereum address sending the AZTEC transaction (not necessarily the note signer)
 * @param {string} privateKey the private key of message signer
 * @returns {string[]} ECDSA signature parameters, `[r, s, v]`, formatted as 32-byte wide hex-strings
 */
signer.signTypedData = (domain, schema, message, privateKey) => {
    const encodedTypedData = typedData.encodeTypedData({
        domain,
        ...schema,
        message,
    });

    let unformattedSignature = secp256k1.ecdsa.signMessage(encodedTypedData, privateKey);

    const r = unformattedSignature[1].slice(2);
    const s = unformattedSignature[2].slice(2);
    const v = padRight(unformattedSignature[0].slice(-2), 64);
    unformattedSignature = r + s + v;

    return {
        unformattedSignature,
        encodedTypedData,
    };
};

export default signer;
