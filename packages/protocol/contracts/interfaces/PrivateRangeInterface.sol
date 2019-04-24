pragma solidity >=0.5.0 <0.6.0;


contract PrivateRangeInterface {
    /* solhint-disable-next-line var-name-mixedcase */
    constructor() public {}
    
    function validatePrivateRange(
        bytes calldata, 
        address, 
        uint[6] calldata
    ) 
        external
        pure
        returns (bool) 
    {}
}
