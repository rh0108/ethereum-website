pragma solidity 0.4.24;

import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

import "./NoteUtilities.sol";
import "./ACE.sol";

contract NoteRegistry {
    using NoteUtilities for bytes;

    struct Note {
        uint8 status;
        bytes5 createdOn;
        bytes5 destroyedOn;
        address owner;
    }

    uint256 public totalSupply;
    bytes32[4] public totalSupplyPrivate;

    struct Flags {
        bool canMint;
        bool canBurn;
        bool canConvert;
    }

    Flags public flags;
    ERC20 public linkedToken;
    ACE public ace;

    uint256 public linkedTokenScalingFactor;
    address public registryOwner;
    mapping(bytes32 => Note) public registry;

    constructor(
        bool _canMint,
        bool _canBurn,
        bool _canConvert,
        uint256 _linkedTokenScalingFactor,
        address _linkedToken,
        address _ace,
        address _owner
    ) public {
        flags = Flags(_canMint, _canBurn, _canConvert);
        if (_linkedToken != address(0)) {
            linkedToken = ERC20(_linkedToken);
        }
        linkedTokenScalingFactor = _linkedTokenScalingFactor;
        registryOwner = _owner;
        ace = ACE(_ace);
    }

    function updateNoteRegistry(bytes _proofOutput, uint16 _proofType, address _proofSender) public returns (bool) {
        require(msg.sender == registryOwner);
        bytes32 proofHash = _proofOutput.hashProofOutput();
        require(
            ace.validateProofByHash(_proofType, proofHash, _proofSender) == true,
            "ACE has not validated a matching proof"
        );
        (bytes memory inputNotes,
        bytes memory outputNotes,
        address publicOwner,
        int256 publicValue) = _proofOutput.extractProofOutput();

        updateInputNotes(inputNotes);
        updateOutputNotes(outputNotes);


        if (publicValue != 0) {
            require(flags.canConvert == true, "this asset cannot be converted into public tokens!");
            if (publicValue < 0) {
                totalSupply += uint256(-publicValue);
                require(linkedToken.transferFrom(publicOwner, this, uint256(-publicValue)), "transfer failed!");
            } else {
                totalSupply -= uint256(publicValue);
                require(linkedToken.transfer(publicOwner, uint256(publicValue)), "transfer failed!");
            }
        }
        return true;
    }

    function updateInputNotes(bytes memory inputNotes) internal {
        for (uint i = 0; i < inputNotes.getLength(); i += 1) {
            (address owner, bytes32 noteHash,) = inputNotes.get(i).extractNote();
            Note storage note = registry[noteHash];
            require(note.status == 1, "input note does not exist!");
            require(note.owner == owner, "input note owner does not match!");
            note.status = uint8(2);
            // AZTEC uses timestamps to measure the age of a note, on timescales of days/months
            // The 900-ish seconds a miner can manipulate a timestamp should have little effect
            // solhint-disable-next-line not-rely-on-time
            note.destroyedOn = bytes5(now);
        }
    }

    function updateOutputNotes(bytes memory outputNotes) internal {
        for (uint i = 0; i < outputNotes.getLength(); i += 1) {
            (address owner, bytes32 noteHash,) = outputNotes.get(i).extractNote();
            Note storage note = registry[noteHash];
            require(note.status == 0, "output note exists!");
            note.status = uint8(1);
            // AZTEC uses timestamps to measure the age of a note on timescales of days/months
            // The 900-ish seconds a miner can manipulate a timestamp should have little effect
            // solhint-disable-next-line not-rely-on-time
            note.createdOn = bytes5(now);
            note.owner = owner;
        }
    }
}
