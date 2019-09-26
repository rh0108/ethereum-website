/* global artifacts */
const { proofs } = require('@aztec/dev-utils');

const ACE = artifacts.require('@aztec/protocol/contracts/ACE/ACE.sol');
const PrivateRange = artifacts.require('@aztec/protocol/contracts/ACE/validators/privateRange/PrivateRange.sol');
const PrivateRangeInterface = artifacts.require('@aztec/protocol/contracts/interfaces/PrivateRangeInterface.sol');

PrivateRange.abi = PrivateRangeInterface.abi;

module.exports = (deployer) => {
    return deployer.deploy(PrivateRange).then(async ({ address: privateRangeAddress }) => {
        const ace = await ACE.at(ACE.address);
        await ace.setProof(proofs.PRIVATE_RANGE_PROOF, privateRangeAddress);
    });
};
