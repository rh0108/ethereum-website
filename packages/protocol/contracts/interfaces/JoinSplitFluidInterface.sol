pragma solidity >=0.5.0 <0.6.0;

import "../libs/LibEIP712.sol";

/**
 * @title JoinSplitFluidInterface
 * @author AZTEC
 * @dev Interface for the JoinSplitFluid validator contract
 * Copyright Spilsbury Holdings Ltd 2019. All rights reserved.
**/
contract JoinSplitFluidInterface is LibEIP712 {
    /* solhint-disable-next-line var-name-mixedcase */

    constructor() public {}

    function validateJoinSplitFluid(
        bytes calldata, // proof data
        address, // sender address
        uint[6] calldata // common reference string
    )
        external
        pure
        returns (bytes memory) // returns a series of transfer instructions
    {}
}
