pragma solidity ^0.4.24;

import "./AZTEC.sol";

/**
 * @title ERC20 interface
 * @dev https://github.com/ethereum/EIPs/issues/20
 **/
contract ERC20Interface {
    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/**
 * @title  AZTEC token, providing a confidential representation of an ERC20 token 
 * @author Zachary Williamson, AZTEC
 * Copyright Spilsbury Holdings Ltd 2018. All rights reserved.
 * We will be releasing AZTEC as an open-source protocol that provides efficient transaction privacy for Ethereum.
 * Our full vision of the protocol includes confidential cross-asset interactions via our family of 
 * AZTEC zero-knowledge proofs and the AZTEC token standard, stay tuned for updates!
 **/
contract AZTECERC20Bridge {
    uint private constant GROUP_MODULUS_BOUNDARY =
    10944121435919637611123202872628637544274182200208017171849102093287904247808;

    uint private constant GROUP_MODULUS =
    21888242871839275222246405745257275088548364400416034343698204186575808495617;

    bytes32[4] private setupPubKey;
    bytes32 private domainHash;
    uint public scalingFactor;
    mapping(bytes32 => address) public noteRegistry;
    ERC20Interface private token;

    event LogCreate(bytes32 domainHash, address contractAddress);
    event LogConfidentialTransfer();

    /**
     * @dev contract constructor.
     * @param _setupPubKey the trusted setup public key (group element of group G2)
     * @param _token the address of the ERC20 token being attached to
     * @param _scalingFactor the mapping from note value -> ERC20 token value.
     * AZTEC notes have a range between 0 and 2^{25}-1 and ERC20 tokens range between 0 and 2^{255} - 1
     * so we don't want to directly map note value : token value
     **/
    constructor(
        bytes32[4] _setupPubKey, 
        address _token, 
        uint256 _scalingFactor
    ) 
        public 
    {
        setupPubKey = _setupPubKey;
        token = ERC20Interface(_token);
        scalingFactor = _scalingFactor;
        bytes32 _domainHash;
        assembly {
            let m := mload(0x40)
            // "EIP712Domain(string name,string version,address verifyingContract)"
            mstore(m, 0x91ab3d17e3a50a9d89e63fd30b92be7f5336b03b287bb946787a83a9d62a2766)
            // name = "AZTECERC20BRIDGE_DOMAIN"
            mstore(add(m, 0x20), 0x60d177492a60de7c666b3e3d468f14d59def1d4b022d08b6adf554d88da60d63)
            // version = "1"
            mstore(add(m, 0x40), 0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6)
            mstore(add(m, 0x60), address) // verifying contract
            _domainHash := keccak256(m, 0x80)
        }
        domainHash = _domainHash;
        emit LogCreate(_domainHash, this);
    }

    /**
     * @dev Perform a confidential transaction. Takes ```m``` input notes and ```notes.length - m``` output notes.
     * ```notes, m, challenge``` constitute an AZTEC zero-knowledge proof that states the following:
     * The sum of the values of the input notes is equal
     * to a the sum of the values of the output notes + a public commitment value ```kPublic```
     * \sum_{i=0}^{m-1}k_i = \sum_{i=m}^{n-1}k_i + k_{public} (mod p)
     * notes[6][] contains value ```kPublic```  at notes[notes.length - 1][0].
     * If ```kPublic``` is negative, this represents ```(GROUP_MODULUS - kPublic) * SCALING_FACTOR``` 
     * ERC20 tokens being converted into confidential note form.
     * If ```kPublic``` is positive, this represents ```kPublic * SCALING_FACTOR``` worth of AZTEC notes 
     * being converted into ERC20 form
     * @param notes defines AZTEC input notes and output notes. 
     *  notes[0,...,m-1] = input notes. 
     *  notes[m,...,notes.length-1] = output notes
     * @param m where notes[0,..., m - 1] = input notes. notes[m,...,notes.length - 1] = output notes
     * @param challenge AZTEC zero-knowledge proof challenge variable
     * @param inputSignatures array of ECDSA signatures, one for each input note
     * @param outputOwners addresses of owners, one for each output note
     * Unnamed param is metadata: if AZTEC notes are assigned to stealth addresses, metadata should contain
     * the ephemeral keys required for note owner to identify their note
     */
    function confidentialTransfer(
        bytes32[6][] notes, 
        uint256 m, 
        uint256 challenge, 
        bytes32[3][] inputSignatures, 
        address[] outputOwners, 
        bytes
    ) 
        external 
    {
        require(inputSignatures.length == m, "input signature length invalid");
        require(inputSignatures.length + outputOwners.length == notes.length, "array length mismatch");

        // validate AZTEC zero-knowledge proof
        require(AZTECInterface.validateJoinSplit(notes, m, challenge, setupPubKey), "proof not valid!");

        // extract variable kPublic from proof
        uint256 kPublic = uint(notes[notes.length - 1][0]);
        require(kPublic < GROUP_MODULUS, "invalid value of kPublic");

        // iterate over the notes array and validate each input/output note
        for (uint256 i = 0; i < notes.length; i++) {

            // if i < m this is an input note
            if (i < m) {

                // call validateInputNote to check that the note exists and that we have 
                // a matching signature over the note.
                // pass domainHash in as a function parameter to prevent multiple sloads
                // this will remove the input notes from noteRegistry
                validateInputNote(notes[i], inputSignatures[i], challenge, domainHash);
            } else {

                // if i >= m this is an output note
                // validate that output notes, attached to the specified owners do not exist in noteRegistry.
                // if all checks pass, add notes into note registry
                validateOutputNote(notes[i], outputOwners[i - m]);
            }
        }

        if (kPublic > 0) {
            if (kPublic < GROUP_MODULUS_BOUNDARY) {

            // if value < the group modulus boundary then this public value represents a conversion
            // from confidential note form to public form. call token.transfer to send relevent tokens
                require(token.transfer(msg.sender, kPublic * scalingFactor), "token transfer to user failed!");
            } else {

                // if value > group modulus boundary, this represents a commitment of a public value into 
                // confidential note form. only proceed if the required transferFrom call from msg.sender
                // to this contract succeeds
                require(
                    token.transferFrom(msg.sender, this, (GROUP_MODULUS - kPublic) * scalingFactor), 
                    "token transfer from user failed!"
                );
            }
        }

        // emit an event to mark this transaction. Can recover notes + metadata from input data
        emit LogConfidentialTransfer();
    }

    /**
     * @dev Determine validity of an input note and remove from note registry
     * 1. validate that the note is signed by the note owner
     * 2. validate that the note exists in the note registry
     *
     * Note signature is EIP712 signature (https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md) over
     * the following struct:
     *
     * struct AZTEC_NOTE_SIGNATURE {
     *     bytes32[4] note;
     *     uint256 challenge;
     *     address sender;    
     * };
     * @param note AZTEC confidential note being destroyed
     * @param signature ECDSA signature from note owner
     * @param challenge AZTEC zero-knowledge proof challenge
     * @param domainHashT Temporary holding ```domainHash``` (to minimize # of sload ops)
     **/
    function validateInputNote(
        bytes32[6] note, 
        bytes32[3] signature, 
        uint challenge, 
        bytes32 domainHashT
    ) 
        internal 
    {
        bytes32 noteHash;
        bytes32 signatureMessage;
        assembly {
            let m := mload(0x40)
            mstore(m, mload(add(note, 0x40)))
            mstore(add(m, 0x20), mload(add(note, 0x60)))
            mstore(add(m, 0x40), mload(add(note, 0x80)))
            mstore(add(m, 0x60), mload(add(note, 0xa0)))
            noteHash := keccak256(m, 0x80)
            // keccak256 hash of "AZTEC_NOTE_SIGNATURE(bytes32[4] note,uint256 challenge,address sender)"
            mstore(m, 0x0f1ea84c0ceb3ad2f38123d94a164612e1a0c14a694dc5bfa16bc86ea1f3eabd)
            mstore(add(m, 0x20), noteHash)
            mstore(add(m, 0x40), challenge)
            mstore(add(m, 0x60), caller)
            mstore(add(m, 0x40), keccak256(m, 0x80))
            mstore(add(m, 0x20), domainHashT)
            mstore(m, 0x1901)
            signatureMessage := keccak256(add(m, 0x1e), 0x42)
        }
        address owner = ecrecover(signatureMessage, uint8(signature[0]), signature[1], signature[2]);
        require(owner != address(0), "signature invalid");
        require(noteRegistry[noteHash] == owner, "expected input note to exist in registry");
        noteRegistry[noteHash] = 0;
    }

    /**
     * @dev Validate an output note from an AZTEC confidential transaction
     * If the note does not already exist in ```noteRegistry```, create it
     * @param note AZTEC confidential note to be created
     * @param owner The address of the note owner
     **/
    function validateOutputNote(bytes32[6] note, address owner) internal {
        bytes32 noteHash; // Construct a keccak256 hash of the note coordinates.
        assembly {
            let m := mload(0x40)
            mstore(m, mload(add(note, 0x40)))
            mstore(add(m, 0x20), mload(add(note, 0x60)))
            mstore(add(m, 0x40), mload(add(note, 0x80)))
            mstore(add(m, 0x60), mload(add(note, 0xa0)))
            noteHash := keccak256(m, 0x80)
        }
        require(owner != address(0), "owner must be valid Ethereum address");
        require(noteRegistry[noteHash] == 0, "expected output note to not exist in registry");
        noteRegistry[noteHash] = owner;
    }
}
