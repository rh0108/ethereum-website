const BN = require('bn.js');
const { keccak256, padLeft } = require('web3-utils');

const H_X = new BN('7673901602397024137095011250362199966051872585513276903826533215767972925880', 10);
const H_Y = new BN('8489654445897228341090914135473290831551238522473825886865492707826370766375', 10);
const t2 = [
    `0x${padLeft('1cf7cc93bfbf7b2c5f04a3bc9cb8b72bbcf2defcabdceb09860c493bdf1588d', 64)}`,
    `0x${padLeft('8d554bf59102bbb961ba81107ec71785ef9ce6638e5332b6c1a58b87447d181', 64)}`,
    `0x${padLeft('204e5d81d86c561f9344ad5f122a625f259996b065b80cbbe74a9ad97b6d7cc2', 64)}`,
    `0x${padLeft('2cb2a424885c9e412b94c40905b359e3043275cd29f5b557f008cd0a3e0c0dc', 64)}`,
];
const CRS = [
    `0x${padLeft(H_X.toString(16), 64)}`,
    `0x${padLeft(H_Y.toString(16), 64)}`,
    ...t2,
];

/**
 * Helper module that contains key constants for our zero-knowledge proving system
 *
 * @module params
 */
module.exports = {
    /**
     *  The domain and signature constants below are related to EIP712
     */ 
    AZTEC_RINKEBY_DOMAIN_PARAMS: {
        name: 'AZTEC_RINKEBY_DOMAIN',
        version: '1',
        salt: '0x210db872dec2e06c375dd40a5a354307bb4ba52ba65bd84594554580ae6f0639',
    },
    AZTEC_MAINNET_DOMAIN_PARAMS: {
        name: 'AZTEC_MAINNET_DOMAIN',
        version: '1',
        salt: '0x210db872dec2e06c375dd40a5a354307bb4ba52ba65bd84594554580ae6f0639',
    },
    AZTEC_NOTE_SIGNATURE: {
        types: {
            AZTEC_NOTE_SIGNATURE: [
                { name: 'note', type: 'bytes32[4]' },
                { name: 'challenge', type: 'uint256' },
                { name: 'sender', type: 'address' },
            ],
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'verifyingContract', type: 'address' },
            ],
        },
        primaryType: 'AZTEC_NOTE_SIGNATURE',
    },
    ACE_DOMAIN_PARAMS: {
        name: 'AZTEC_CRYPTOGRAPHY_ENGINE',
        version: '1',
    },
    ACE_NOTE_SIGNATURE: {
        types: {
            ACE_NOTE_SIGNATURE: [
                { name: 'proofId', type: 'uint16' },
                { name: 'note', type: 'bytes32[4]' },
                { name: 'challenge', type: 'uint256' },
                { name: 'sender', type: 'address' },
            ],
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'verifyingContract', type: 'address' },
            ],
        },
        primaryType: 'ACE_NOTE_SIGNATURE',
    },
    ACE_NOTE_SIGNATURE_HASH: keccak256('NoteSignature(bytes32 noteHash,address spender,bool status)'),
    /**
     * Common reference string
     */
    CRS,
    /**
     * Address of the DAI stablecoin contract on Ethereum
     * @constant DAI_ADDRESS
     * @type {string}
     * @default '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
     */
    DAI_ADDRESS: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', // address of the mainNet DAI smart contract
    /**
     * Generic scaling factor that maps between AZTEC note values and ERC20 token balances.
     * when used for DAI token, 1 AZTEC note value = 0.1 DAI
     */
    ERC20_SCALING_FACTOR: new BN('100000000000000000', 10),
    /**
     * Dummy network id used in contract testing
     */
    FAKE_NETWORK_ID: 100,
    /** Maximum value that can be held in an AZTEC Note
     *  @constant K_MAX
     *  @type {string}
     *  @default 1048576
     */
    K_MAX: 1048576,
    /** Minimum value of an AZTEC Note
     *  @constant K_MIN
     *  @type {string}
     *  @default 0
     */
    K_MIN: 0,
    /** modulus of bn128 curve's finite field (p)
     *  @constant FIELD_MODULUS
     *  @type {BN}
     *  @default 21888242871839275222246405745257275088696311157297823662689037894645226208583
     */
    FIELD_MODULUS: new BN('21888242871839275222246405745257275088696311157297823662689037894645226208583', 10),
    /** modulus of bn128's elliptic curve group (n)
     *  @constant GROUP_MODULUS
     *  @type {BN}
     *  @default 21888242871839275222246405745257275088548364400416034343698204186575808495617
     */
    GROUP_MODULUS: new BN('21888242871839275222246405745257275088548364400416034343698204186575808495617', 10),
    /**
     * X-Coordinate of AZTEC's second generator point 'h'.
     *      Created by taking the keccak256 hash of the asci string 'just read the instructions', right-padded to 32 bytes.  
     *      i.e: 0x6A75737420726561642074686520696E737472756374696F6E73000000000000.  
     *      H_X is the result of this hash, modulo the elliptic curve group modulus n.
     *  @constant H_X
     *  @type {BN}
     *  @default 7673901602397024137095011250362199966051872585513276903826533215767972925880
     */
    H_X,
    /** Y-Coordinate of AZTEC's second generator point 'h'. Created from odd-valued root of (H_X^{3} + 3)
     *  @constant H_Y
     *  @type {BN}
     *  @default 8489654445897228341090914135473290831551238522473825886865492707826370766375
     */
    H_Y,
    /** bytes32-formatted trusted setup public key
     *  @constant t2
     *  @type {BN}
     */
    t2,
    /** Number of signatures per file in trusted setup database
     *  @constant SIGNATURES_PER_FILE
     *  @type {number}
     *  @default 1024
     */
    SIGNATURES_PER_FILE: 1024,
    /**
     * Generic burning Etheruem address
     */
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
};
