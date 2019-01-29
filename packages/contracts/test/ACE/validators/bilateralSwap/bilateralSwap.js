/* global artifacts, expect, contract, beforeEach, it:true */
// ### External Dependencies
const BN = require('bn.js');
const crypto = require('crypto');
const { padLeft, sha3 } = require('web3-utils');

// ### Internal Dependencies
const aztec = require('aztec.js');
const { params: { t2 } } = require('aztec.js');
const { proof: { bilateralSwap } } = require('aztec.js');

const exceptions = require('../../../../utils/exceptions');

// ### Artifacts
const BilateralSwap = artifacts.require('./contracts/ACE/validators/AZTECBilateralSwap');
const BilateralSwapInterface = artifacts.require('./contracts/ACE/validators/BilateralSwapInterface');


BilateralSwap.abi = BilateralSwapInterface.abi;

const fakeNetworkId = 100;

function encodeBilateralSwapTransaction({
    inputNotes,
    outputNotes,
    senderAddress,
}) {
    const {
        proofData: proofDataRaw,
        challenge,
    } = bilateralSwap.constructBilateralSwap([...inputNotes, ...outputNotes], senderAddress);

    const inputOwners = inputNotes.map(m => m.owner);
    const outputOwners = outputNotes.map(n => n.owner);

    const proofData = aztec.abiEncoder.bilateralSwap.encode(
        proofDataRaw,
        challenge,
        inputOwners,
        outputOwners,
        outputNotes
    );

    const publicOwner = '0x0000000000000000000000000000000000000000';
    const publicValue = 0;

    const expectedOutput = `0x${aztec.abiEncoder.bilateralSwap.outputCoder.encodeProofOutputs([{
        inputNotes,
        outputNotes,
        publicOwner,
        publicValue,
    }]).slice(0x42)}`;
    return { proofData, expectedOutput };
}

contract.only('Bilateral Swap', (accounts) => {
    let bilateralSwapContract;
    // Creating a collection of tests that should pass
    describe('success states', () => {
        let crs;
        let bilateralSwapAccounts = [];
        let notes = [];

        beforeEach(async () => {
            bilateralSwapContract = await BilateralSwap.new(fakeNetworkId, {
                from: accounts[0],
            });
            // Need to set the value of the notes created, to be consistent with the 
            // bilateral swap condition

            const noteValues = [10, 20, 10, 20];

            bilateralSwapAccounts = [...new Array(4)].map(() => aztec.secp256k1.generateAccount());
            notes = [
                ...bilateralSwapAccounts.map(({ publicKey }, i) => aztec.note.create(publicKey, noteValues[i])),
            ];

            const hx = new BN('7673901602397024137095011250362199966051872585513276903826533215767972925880', 10);
            const hy = new BN('8489654445897228341090914135473290831551238522473825886865492707826370766375', 10);
            crs = [
                `0x${padLeft(hx.toString(16), 64)}`,
                `0x${padLeft(hy.toString(16), 64)}`,
                ...t2,
            ];
        });

        it('succesfully validate output encoding for bilateral proof in zero-knowledge', async () => {
            const inputNotes = notes.slice(0, 2);
            const outputNotes = notes.slice(2, 4);
            const { proofData, expectedOutput } = encodeBilateralSwapTransaction({
                inputNotes,
                outputNotes,
                senderAddress: accounts[0],
            });


            const result = await bilateralSwapContract.validateBilateralSwap(proofData, accounts[0], crs, {
                from: accounts[0],
                gas: 4000000,
            });
            
            const decoded = aztec.abiEncoder.bilateralSwap.outputCoder.decodeProofOutputs(`0x${padLeft('0', 64)}${result.slice(2)}`);
            expect(decoded[0].outputNotes[0].gamma.eq(outputNotes[0].gamma)).to.equal(true);
            expect(decoded[0].outputNotes[0].sigma.eq(outputNotes[0].sigma)).to.equal(true);
            expect(decoded[0].outputNotes[0].noteHash).to.equal(outputNotes[0].noteHash);
            expect(decoded[0].outputNotes[0].owner).to.equal(outputNotes[0].owner.toLowerCase());
            expect(decoded[0].outputNotes[1].gamma.eq(outputNotes[1].gamma)).to.equal(true);
            expect(decoded[0].outputNotes[1].sigma.eq(outputNotes[1].sigma)).to.equal(true);
            expect(decoded[0].outputNotes[1].noteHash).to.equal(outputNotes[1].noteHash);
            expect(decoded[0].outputNotes[1].owner).to.equal(outputNotes[1].owner.toLowerCase());

            expect(decoded[0].inputNotes[0].gamma.eq(inputNotes[0].gamma)).to.equal(true);
            expect(decoded[0].inputNotes[0].sigma.eq(inputNotes[0].sigma)).to.equal(true);
            expect(decoded[0].inputNotes[0].noteHash).to.equal(inputNotes[0].noteHash);
            expect(decoded[0].inputNotes[0].owner).to.equal(inputNotes[0].owner.toLowerCase());
            expect(decoded[0].inputNotes[1].gamma.eq(inputNotes[1].gamma)).to.equal(true);
            expect(decoded[0].inputNotes[1].sigma.eq(inputNotes[1].sigma)).to.equal(true);
            expect(decoded[0].inputNotes[1].noteHash).to.equal(inputNotes[1].noteHash);
            expect(decoded[0].inputNotes[1].owner).to.equal(inputNotes[1].owner.toLowerCase());

            expect(result).to.equal(expectedOutput);

            const gasUsed = await bilateralSwapContract.validateBilateralSwap.estimateGas(proofData, accounts[0], crs, {
                from: accounts[0],
                gas: 4000000,
            });
            console.log('gas used = ', gasUsed);
        });
    });
});
