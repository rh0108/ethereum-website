pragma solidity >=0.5.0 <0.6.0;

import "../../../../../interfaces/IAZTEC.sol";
import "../../../../../libs/NoteUtils.sol";
import "../Behaviour201911.sol";
import "../../201907/adjustable/BehaviourAdjustable201907.sol";

/**
 * @title BehaviourBase201907
 * @author AZTEC
 * @dev This contract extends Behaviour201907.
        Methods are documented in interface.
 *
 * Copyright Spilsbury Holdings Ltd 2019. All rights reserved.
 **/
contract BehaviourAdjustable201911 is Behaviour201911, BehaviourAdjustable201907 {
    constructor () BehaviourAdjustable201907() public {}
}
