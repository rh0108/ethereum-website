pragma solidity >= 0.5.0 <0.6.0;

library ProofUtils {

    /**
     * @dev We compress three uint8 numbers into one single uint24 to save gas.
     * Reverts if the category is not one of [0, 1, 2, 3].
     * @param proof The compressed uint24 number.
     * @return A tuple (uint8, uint8, uint8) representing the epoch, category and proofId.
     */
    function getProofComponents(uint24 proof) internal pure returns (uint8 epoch, uint8 category, uint8 id) {
        // assembly {
        //     id := and(proof, 0xff)
        //     category := and(div(proof, 0x100), 0xff)
        //     epoch := and(div(proof, 0x10000), 0xff)
        // }
        epoch = uint8(proof >> 0x10);
        category = uint8(proof >> 0x08);
        id = uint8(proof);
        require(category >= 0 && category <= 3, "category uint8 has to be at least 0 and at maximum 3");
        return (epoch, category, id);
    }
}
