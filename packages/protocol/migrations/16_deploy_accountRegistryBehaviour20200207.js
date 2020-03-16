/* global artifacts */
const dotenv = require('dotenv');

dotenv.config();
const AccountRegistryBehaviour20200207 = artifacts.require('./AccountRegistry/epochs/20200207/Behaviour20200207');
const AccountRegistryManager = artifacts.require('./AccountRegistry/AccountRegistryManager');

module.exports = (deployer, network) => {
    return deployer.deploy(AccountRegistryBehaviour20200207).then(async (behaviourContract) => {
        const isLocal = network === 'development' || network === 'test';

        // Get the manager contract instance
        let managerContract;
        if (isLocal) {
            managerContract = await AccountRegistryManager.deployed();
        } else {
            managerContract = await AccountRegistryManager.at(AccountRegistryManager.address);
        }

        // Perform the upgrade
        await managerContract.upgradeAccountRegistry(behaviourContract.address);

        // Get the proxy contract instance
        const proxyAddress = await managerContract.proxyAddress();
        const proxyContract = await AccountRegistryBehaviour20200207.at(proxyAddress);

        // Set the GSN signer address
        await proxyContract.setGSNSigner();
    });
};
