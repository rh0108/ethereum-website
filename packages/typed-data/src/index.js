/**
 * Module to construct ECDSA messages for structured data,
 * following the [EIP712]{@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md} standard
 *
 * @module sign.signer
 */

const { AbiCoder } = require('web3-eth-abi');
const { keccak256, padLeft } = require('web3-utils');

const abiCoder = new AbiCoder();

const signer = {};

function padKeccak256(data) {
    return padLeft(keccak256(data).slice(2), 64);
}

/**
 * Recursively encode a struct's data into a unique string
 *
 * @method encodeMessageData
 * @param {Object} types set of all types encompassed by struct
 * @param {string} types.name name
 * @param {string} types.type type
 * @param {string} primaryType the top-level type of the struct
 * @param {Object} message the struct instance's data
 * @returns {string} encoded message data string
 */
signer.encodeMessageData = function encodeMessageData(types, primaryType, message) {
    return types[primaryType].reduce((acc, { name, type }) => {
        if (types[type]) {
            return `${acc}${padKeccak256(`0x${encodeMessageData(types, type, message[name])}`)}`;
        }
        if (type === 'string' || type === 'bytes') {
            return `${acc}${padKeccak256(message[name])}`;
        }
        if (type.includes('[')) {
            return `${acc}${padKeccak256(abiCoder.encodeParameter(type, message[name]))}`;
        }
        return `${acc}${abiCoder.encodeParameters([type], [message[name]]).slice(2)}`;
    }, padKeccak256(signer.encodeStruct(primaryType, types)));
};

/**
 * Create 'type' component of a struct
 *
 * @method encodeStruct
 * @param {string} primaryType the top-level type of the struct
 * @param {Object} types set of all types encompassed by struct
 * @param {string} types.name name
 * @param {string} types.type type
 * @returns {string} encoded type string
 */
signer.encodeStruct = (primaryType, types) => {
    const findTypes = (type) =>
        [type].concat(
            types[type].reduce((acc, { type: typeKey }) => {
                if (types[typeKey] && acc.indexOf(typeKey) === -1) {
                    return [...acc, ...findTypes(typeKey)];
                }
                return acc;
            }, []),
        );
    return [primaryType]
        .concat(
            findTypes(primaryType)
                .sort((a, b) => a.localeCompare(b))
                .filter((a) => a !== primaryType),
        )
        .reduce(
            (acc, key) =>
                `${acc}${key}(${types[key].reduce((iacc, { name, type }) => `${iacc}${type} ${name},`, '').slice(0, -1)})`,
            '',
        );
};

/**
 * Construct ECDSA signature message for structured data. For why we use 0x1901 as the prefix, check out the link below:
 * @see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-191.md
 *
 * @method encodeTypedData
 * @param {Object} typedData the EIP712 struct object
 * @returns {string} encoded message string
 */
signer.encodeTypedData = (typedData) => {
    const domainHash = padKeccak256(`0x${signer.encodeMessageData(typedData.types, 'EIP712Domain', typedData.domain)}`);
    const structHash = padKeccak256(`0x${signer.encodeMessageData(typedData.types, typedData.primaryType, typedData.message)}`);
    return `0x${padKeccak256(`0x1901${domainHash}${structHash}`)}`;
};

module.exports = signer;
