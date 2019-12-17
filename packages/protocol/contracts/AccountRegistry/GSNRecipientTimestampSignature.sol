pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol";


/**
 * @dev A xref:ROOT:gsn-strategies.adoc#gsn-strategies[GSN strategy] that allows relayed transactions through when they are
 * accompanied by the signature of a trusted signer. The intent is for this signature to be generated by a server that
 * performs validations off-chain. Note that nothing is charged to the user in this scheme. Thus, the server should make
 * sure to account for this in their economic and threat model.
 */
contract GSNRecipientTimestampSignature is Initializable, GSNRecipient {
    using ECDSA for bytes32;

    uint256 constant private RELAYED_CALL_REJECTED = 11;

    address private _trustedSigner;

    enum GSNRecipientSignatureErrorCodes {
        INVALID_SIGNER,
        INVALID_TIMESTAMP
    }

    /**
     * @dev Sets the trusted signer that is going to be producing signatures to approve relayed calls.
     */
    function initialize(address trustedSigner) public initializer {
        require(trustedSigner != address(0), "GSNRecipientSignature: trusted signer is the zero address");
        _trustedSigner = trustedSigner;

        GSNRecipient.initialize();
    }

    /**
     * @dev Return this in acceptRelayedCall to impede execution of a relayed call. No fees will be charged.
     */
    function _rejectRelayedCall(uint256 errorCode, bytes memory context) internal pure returns (uint256, bytes memory) {
        return (RELAYED_CALL_REJECTED + errorCode, context);
    }

    /**
     * @dev Ensures that only transactions with a trusted signature can be relayed through the GSN.
     */
    function acceptRelayedCall(
        address relay,
        address from,
        bytes calldata encodedFunction,
        uint256 transactionFee,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 nonce,
        bytes calldata approvalData,
        uint256
    )
        external
        view
        returns (uint256, bytes memory context)
    {
        (
            uint256 maxTimestamp,
            bytes memory signature
        ) = abi.decode(approvalData, (uint256, bytes));

        bytes memory blob = abi.encodePacked(
            relay,
            from,
            encodedFunction,
            transactionFee,
            gasPrice,
            gasLimit,
            nonce, // Prevents replays on RelayHub
            getHubAddr(), // Prevents replays in multiple RelayHubs
            address(this), // Prevents replays in multiple recipients
            maxTimestamp // Prevents sends tx after long perion of time
        );
        context = abi.encode(signature);

        if (keccak256(blob).toEthSignedMessageHash().recover(signature) == _trustedSigner) {
            if (block.timestamp > maxTimestamp) {
                return _rejectRelayedCall(uint256(GSNRecipientSignatureErrorCodes.INVALID_TIMESTAMP), context);
            }
            return _approveRelayedCall(context);
        } else {
            return _rejectRelayedCall(uint256(GSNRecipientSignatureErrorCodes.INVALID_SIGNER), context);
        }
    }

    function _preRelayedCall(bytes memory) internal returns (bytes32) {
        // solhint-disable-previous-line no-empty-blocks
    }
}
