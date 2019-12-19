pragma solidity >=0.5.0 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./interfaces/IAccountRegistryBehaviour.sol";
import "../Proxies/AdminUpgradeabilityProxy.sol";
import "../Proxies/BaseAdminUpgradeabilityProxy.sol";
import "../interfaces/ProxyAdmin.sol";
import "../libs/Modifiers.sol";

/**
 * @title AccountRegistryManager
 * @author AZTEC
 * @dev Manager contract that manages the deployment of proxy contracts and upgrading
 * of account registries
 *
 * Copyright Spilsbury Holdings Ltd 2019. All rights reserved.
 */
contract AccountRegistryManager is Ownable, Modifiers {
    using SafeMath for uint256;

    IAccountRegistryBehaviour public behaviour;
    address public accountRegistry;
    address public proxy;
    uint256 public latestEpoch = 0;

    event CreateProxy(address proxyAddress, address proxyAdmin);
    event IncrementLatestEpoch(uint256 newLatestEpoch);
    event UpgradeAccountRegistry(address proxyAddress, address newBehaviourAddress);

    /**
     * @dev Deploy the proxy contract. This stores all state for the AccountRegistry contract system
     * @param initialBehaviourAddress - address of the behaviour contract to be linked to be initialised
     * when the proxy is deployed 
     * @param aceAddress - address of ACE
     * @param trustedAddress - address that is being trusted to produce signatures approving relayed calls
     */
    function deployProxy(
        address initialBehaviourAddress,
        address aceAddress,
        address trustedAddress
    ) public onlyOwner checkZeroAddress(initialBehaviourAddress) {
        bytes memory initialiseData = abi.encodeWithSignature(
            "initialize(address,address)",
            aceAddress,
            trustedAddress
        );
        address admin = address(this);

        address proxyAddress = address(new AdminUpgradeabilityProxy(
            initialBehaviourAddress,
            admin,
            initialiseData 
        ));
    
        proxy = proxyAddress;
        behaviour = IAccountRegistryBehaviour(proxyAddress);
        accountRegistry = initialBehaviourAddress;

        incrementLatestEpoch();
        emit CreateProxy(proxyAddress, admin);
    }
    

    /**
     * @dev Get the current behaviour contract address
     * @param proxyAddress - address of the relevant proxy
     * @return implementation - address of the behaviour contract
     */
    function getImplementation(address payable proxyAddress) public returns (address implementation) {
        implementation = BaseAdminUpgradeabilityProxy(proxyAddress).implementation();
    }

    /**
     * @dev Increment the `latestEpoch` storage variable.
     */
    function incrementLatestEpoch() internal {
        latestEpoch = latestEpoch.add(1);
        emit IncrementLatestEpoch(latestEpoch);
    }

    /**
     * @dev Upgrade the account registry to a new behaviour implementation
     * @param proxyAddress - address of the proxy contract
     * @param newBehaviourAddress - address of the behaviour contract to be upgraded to
    */
    function upgradeAccountRegistry(
        address proxyAddress,
        address newBehaviourAddress
    ) public onlyOwner checkZeroAddress(newBehaviourAddress) checkZeroAddress(proxyAddress)  {
        require(ProxyAdmin(proxyAddress).admin() == address(this), 'this is not the admin of the proxy');
        
        uint256 newBehaviourEpoch = IAccountRegistryBehaviour(newBehaviourAddress).epoch();
        require(
            newBehaviourEpoch >= latestEpoch, 
            'expected new registry to be of epoch equal or greater than existing registry'
        );

        ProxyAdmin(proxyAddress).upgradeTo(newBehaviourAddress);
        incrementLatestEpoch();
        
        accountRegistry = newBehaviourAddress;
        emit UpgradeAccountRegistry(proxyAddress, newBehaviourAddress);
    }
}
