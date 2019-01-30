/* global artifacts, expect, contract, beforeEach, it:true */
// ### External Dependencies
const BN = require('bn.js');
const { padLeft } = require('web3-utils');

// ### Internal Dependencies
const aztec = require('aztec.js');
const { params: { t2 } } = require('aztec.js');


// ### Artifacts
const dividend = artifacts.require('./contracts/ACE/validators/dividendComputation/DividendComputation');
const dividendInterface = artifacts.require('./contracts/ACE/validators/dividendComputation/DividendComputationInterface');


dividend.abi = dividendInterface.abi;

const fakeNetworkId = 100;

function encodeDividendComputationTransaction({
    inputNotes,
    outputNotes,
    za,
    zb,
    senderAddress,
}) {
    const {
        proofData: proofDataRaw,
        challenge,
    } = aztec.proof.dividendComputation.constructProof([...inputNotes, ...outputNotes], za, zb, senderAddress);

    const inputOwners = inputNotes.map(m => m.owner);
    const outputOwners = outputNotes.map(n => n.owner);
    const publicOwner = '0x0000000000000000000000000000000000000000';
    const publicValue = 0;

    const proofDataRawFormatted = [proofDataRaw.slice(0, 6)].concat([proofDataRaw.slice(6, 12), proofDataRaw.slice(12, 18)]);

    const proofData = aztec.abiEncoder.dividendComputation.encode(
        proofDataRawFormatted,
        challenge,
        za,
        zb,
        inputOwners,
        outputOwners,
        outputNotes
    );

    const expectedOutput = `0x${aztec.abiEncoder.dividendComputation.outputCoder.encodeProofOutputs([{
        inputNotes,
        outputNotes,
        publicOwner,
        publicValue,
    }]).slice(0x42)}`;
    return { proofData, expectedOutput, challenge };
}

contract('Dividend Computation', (accounts) => {
    let dividendContract;
    describe('success states', () => {
        let crs;
        let dividendAccounts = [];
        let notes = [];
        let za;
        let zb;

        beforeEach(async () => {
            dividendContract = await dividend.new(fakeNetworkId, {
                from: accounts[0],
            });
            dividendAccounts = [...new Array(3)].map(() => aztec.secp256k1.generateAccount());

            const noteValues = [90, 4, 50];
            za = 100;
            zb = 5;

            notes = [
                ...dividendAccounts.map(({ publicKey }, i) => aztec.note.create(publicKey, noteValues[i])),
            ];
            const hx = new BN('7673901602397024137095011250362199966051872585513276903826533215767972925880', 10);
            const hy = new BN('8489654445897228341090914135473290831551238522473825886865492707826370766375', 10);
            crs = [
                `0x${padLeft(hx.toString(16), 64)}`,
                `0x${padLeft(hy.toString(16), 64)}`,
                ...t2,
            ];
        });

        /*
          General structure of the success state unit tests:
          1) Construct the commitments from a selection of k_in and k_out (input and output values)
          2) Generate the proofData and random challenge. Proof data contains notes,
             and each note contains 6 pieces of information:
              a) gamma_x
              b) gamma_y
              c) sigma_x
              d) sigma_y
              e) k^bar
              f) a^bar
              Note: a), b), c) and d) are the Pedersen commitment data
              Note: Syntax to access proof data for one note: proofData[].
              Syntax to access gamma_x for a particular note: proofData[][0]
          3) Validate that these result in a successfull join-split transaction
          4) Calculate the gas used in validating this join-split transaction
          */

        it('succesfully validates an AZTEC dividend computation zero-knowledge proof', async () => {
            const inputNotes = notes.slice(0, 1);
            const outputNotes = notes.slice(1, 3);

            const { proofData, expectedOutput } = encodeDividendComputationTransaction({
                inputNotes,
                outputNotes,
                za,
                zb,
                senderAddress: accounts[0],
            });

            const publicOwner = '0x0000000000000000000000000000000000000000';

            const result = await dividendContract.validateDividendComputation(proofData, accounts[0], crs, {
                from: accounts[0],
                gas: 4000000,
            });

            const decoded = aztec.abiEncoder.dividendComputation.outputCoder.decodeProofOutputs(
                `0x${padLeft('0', 64)}${result.slice(2)}`
            );

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

            expect(decoded[0].publicOwner).to.equal(publicOwner.toLowerCase());
            expect(decoded[0].publicValue).to.equal(0);
            expect(result).to.equal(expectedOutput);

            const gasUsed = await dividendContract.validateDividendComputation.estimateGas(proofData, accounts[0], crs, {
                from: accounts[0],
                gas: 4000000,
            });
            console.log('gas used = ', gasUsed);
        });
    });
});
