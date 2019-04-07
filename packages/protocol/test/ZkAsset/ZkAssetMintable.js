/* global artifacts, expect, contract, beforeEach, it:true */
// ### External Dependencies
const BN = require('bn.js');
const truffleAssert = require('truffle-assertions');

// ### Internal Dependencies
// eslint-disable-next-line object-curly-newline
const { note, proof, secp256k1 } = require('aztec.js');
const { constants, proofs: { MINT_PROOF, JOIN_SPLIT_PROOF } } = require('@aztec/dev-utils');

// ### Artifacts
const ERC20Mintable = artifacts.require('./contracts/ERC20/ERC20Mintable');
const ACE = artifacts.require('./contracts/ACE/ACE');
const AdjustSupply = artifacts.require('./contracts/ACE/validators/AdjustSupply');
const AdjustSupplyInterface = artifacts.require('./contracts/ACE/validators/AdjustSupplyInterface');
const JoinSplit = artifacts.require('./contracts/ACE/validators/JoinSplit');
const JoinSplitInterface = artifacts.require('./contracts/ACE/validators/JoinSplit');

const ZkAssetMintable = artifacts.require('./contracts/ZkAsset/ZkAssetMintable');


AdjustSupply.abi = AdjustSupplyInterface.abi;
JoinSplit.abi = JoinSplitInterface.abi;

contract('ZkAssetMintable', (accounts) => {
    describe('success states', () => {
        let aztecAccounts = [];
        let ace;
        let erc20;
        let zkAssetMintable;
        let scalingFactor;
        let aztecAdjustSupply;
        let aztecJoinSplit;
        const kPublic = 50;

        beforeEach(async () => {
            ace = await ACE.new({ from: accounts[0] });
            aztecAdjustSupply = await AdjustSupply.new();
            aztecJoinSplit = await JoinSplit.new();

            aztecAccounts = [...new Array(4)].map(() => secp256k1.generateAccount());

            await ace.setCommonReferenceString(constants.CRS);
            await ace.setProof(MINT_PROOF, aztecAdjustSupply.address);
            await ace.setProof(JOIN_SPLIT_PROOF, aztecJoinSplit.address);

            const canAdjustSupply = true;
            const canConvert = true;

            erc20 = await ERC20Mintable.new();
            scalingFactor = new BN(10);

            zkAssetMintable = await ZkAssetMintable.new(
                ace.address,
                erc20.address,
                scalingFactor,
                canAdjustSupply,
                canConvert,
                { from: accounts[0] }
            );
        });

        it('should complete a mint operation', async () => {
            const [owner, recipient1, recipient2] = aztecAccounts;
            const newTotalMinted = note
                .create(owner.publicKey, 50);
            const oldTotalMinted = note
                .createZeroValueNote();

            const mintedNotes = [
                note.create(recipient1.publicKey, 20),
                note.create(recipient2.publicKey, 30),
            ];

            const mintProof = proof.mint
                .encodeMintTransaction({
                    newTotalMinted, // 50
                    oldTotalMinted, // 0
                    adjustedNotes: mintedNotes, // 30 + 20
                    senderAddress: zkAssetMintable.address,
                });

            const { receipt } = await zkAssetMintable
                .confidentialMint(MINT_PROOF, mintProof.proofData);

            expect(receipt.status).to.equal(true);
        });

        it('should transfer minted value out of the note registry', async () => {
            const erc20TotalSupply = (await erc20.totalSupply()).toNumber();
            expect(erc20TotalSupply).to.equal(0);
            const initialBalance = (await erc20.balanceOf(accounts[1])).toNumber();
            const [owner, recipient1, recipient2] = aztecAccounts;
            const newTotalMinted = note
                .create(owner.publicKey, 50);
            const oldTotalMinted = note
                .createZeroValueNote();

            const mintedNotes = [
                note.create(recipient1.publicKey, 20),
                note.create(recipient2.publicKey, 30),
            ];

            const mintProof = proof.mint
                .encodeMintTransaction({
                    newTotalMinted, // 50
                    oldTotalMinted, // 0
                    adjustedNotes: mintedNotes, // 30 + 20
                    senderAddress: zkAssetMintable.address,
                });

            const { receipt: mintReceipt } = await zkAssetMintable
                .confidentialMint(MINT_PROOF, mintProof.proofData);

            expect(mintReceipt.status).to.equal(true);
            const erc20TotalSupplyAfterMint = (await erc20.totalSupply()).toNumber();
            expect(erc20TotalSupplyAfterMint).to.equal(0);

            const withdrawlProof = proof.joinSplit
                .encodeJoinSplitTransaction({
                    inputNotes: mintedNotes, // 20 + 30
                    outputNotes: [],
                    senderAddress: accounts[0],
                    inputNoteOwners: [recipient1, recipient2], // need the owners of the adjustedNotes
                    publicOwner: recipient1.address,
                    kPublic,
                    validatorAddress: aztecJoinSplit.address,
                });

            const { receipt: transferReceipt } = await zkAssetMintable
                .confidentialTransfer(withdrawlProof.proofData);
            
            const erc20TotalSupplyAfterWithdrawl = (await erc20.totalSupply()).toNumber();
            expect(erc20TotalSupplyAfterWithdrawl).to.equal(kPublic * scalingFactor);
            const finalBalance = (await erc20.balanceOf(recipient1.address)).toNumber();
            expect(transferReceipt.status).to.equal(true);
            expect(initialBalance).to.equal(0);
            expect(finalBalance).to.equal(kPublic * scalingFactor);
        });
    });

    describe('failure states', () => {
        let aztecAccounts = [];
        let ace;
        let erc20;
        let zkAssetMintable;
        let scalingFactor;
        let aztecAdjustSupply;
        let aztecJoinSplit;

        beforeEach(async () => {
            ace = await ACE.new({ from: accounts[0] });
            aztecAdjustSupply = await AdjustSupply.new();
            aztecJoinSplit = await JoinSplit.new();

            aztecAccounts = [...new Array(4)].map(() => secp256k1.generateAccount());

            await ace.setCommonReferenceString(constants.CRS);
            await ace.setProof(MINT_PROOF, aztecAdjustSupply.address);
            await ace.setProof(JOIN_SPLIT_PROOF, aztecJoinSplit.address);

            erc20 = await ERC20Mintable.new();
            scalingFactor = new BN(1);

            const canAdjustSupply = false;
            const canConvert = true;

            zkAssetMintable = await ZkAssetMintable.new(
                ace.address,
                erc20.address,
                scalingFactor,
                canAdjustSupply,
                canConvert,
                { from: accounts[0] }
            );
        });

        it('validates failure if mint attempted when flag set to false', async () => {
            const [owner, recipient1, recipient2] = aztecAccounts;

            const newTotalMinted = note
                .create(owner.publicKey, 50);
            const oldTotalMinted = note
                .createZeroValueNote();

            const mintedNotes = [
                note.create(recipient1.publicKey, 20),
                note.create(recipient2.publicKey, 30),
            ];

            const mintProof = proof.mint
                .encodeMintTransaction({
                    newTotalMinted, // 50
                    oldTotalMinted, // 0
                    adjustedNotes: mintedNotes, // 30 + 20
                    senderAddress: zkAssetMintable.address,
                });

            await truffleAssert.reverts(zkAssetMintable.confidentialMint(MINT_PROOF, mintProof.proofData));
        });
    });
});
