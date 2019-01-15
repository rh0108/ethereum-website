# The AZTEC Protocol

**This is a proof of concept. The trusted setup was generated by our team internally. We will be releasing more information about the [production trusted setup](https://github.com/AztecProtocol/AZTEC#the-trusted-setup) generation in the coming weeks. Use at own risk.** 
  
**This repository is under active development, with our interfaces and smart contracts changing substantially as we prepare our Cryptography Engine. If you want to investigate the smart contracts and tooling that created our first zero-knowledge AZTEC transactions, please clone from the [`release-0.1.0`](https://github.com/AztecProtocol/AZTEC/tree/release-0.1.0) branch.**

The AZTEC protocol enables confidential transactions on the Ethereum network, with a working implementation live on the Ethereum main-net.  

* [Read the AZTEC Paper](https://github.com/AztecProtocol/AZTEC/blob/master/AZTEC.pdf)
* [View the AZTEC.sol zero-knowledge validator](https://github.com/AztecProtocol/AZTEC/blob/master/contracts/AZTEC/AZTEC.sol)
* [View a deployed AZTEC zero-knowledge validator Smart Contract](https://etherscan.io/address/0xa43f8675850ac3f60a4d4cec954f1a1b0e1dbb07)
* [View a deployed AZTEC Token Smart Contract, which uses the zero-knowledge validator to create confidential DAI](https://etherscan.io/address/0xcf65A4e884373Ad12cd91c8C868F1DE9DA48501F)
* [Contributing](https://github.com/AztecProtocol/AZTEC#this-sounds-interesting-how-can-i-get-involved)

## Running the demonstration scripts

Please view the README.md in the [demo](https://github.com/AztecProtocol/AZTEC/tree/master/demo) directory.  

## What is the AZTEC Protocol?

The protocol enables transactions of value, where the *values* of the transaction are encrypted. The AZTEC protocol smart contract validator, ```AZTEC.sol```, validates a unique zero-knowledge proof that determines the legitimacy of a transaction via a combination of **homomorphic encryption** and **range proofs**.


## What is encrypted 'value'?

Instead of balances, the protocol uses AZTEC **notes**. A note encrypts a number that represents a value (for example a number of ERC-20 tokens). Each note has an owner, defined via an Ethereum address. In order to *spend* a note the owner must provide a valid ECDSA signature attesting to this.

## What does this enable?

### Confidential representations of ERC20-tokens

The AZTEC protocol can enable confidential transactions for *any* generic digital asset on Ethereum, including *existing* assets. [For our proof of concept implementation of the AZTEC protocol](https://etherscan.io/address/0xcf65A4e884373Ad12cd91c8C868F1DE9DA48501F), we attached an AZTEC token to MakerDAO's DAI token. This smart contract can be used to convert DAI from its public ERC-20 form into a confidential AZTEC note form.

### Fully confidential digital assets

The AZTEC protocol can be utilized as a stand-alone confidential token, with value transfers described entirely through AZTEC **join-split** transactions

### Decentralized Confidential Exchanges

The AZTEC protocol and its decentralized exchange protocol extension (coming soon) can be used to trade AZTEC assets in complete confidentiality, without having to expose the values or prices of any trade.

## How much gas do these transactions cost?

The gas costs scale with the number of input and output notes in a **join-split** transaction. For a fully confidential transfer, with 2 input notes and 2 output notes, the gas cost is approximately 900,000 gas. [Planned EIP improvements](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1108.md) will reduce the cost of these transactions dramatically, to approximately 200,000 - 300,000 gas.

## Where can I see this in action?

The AZTEC protocol is live today on the Etheruem main-net. [Our proof of concept contract](https://etherscan.io/address/0xcf65A4e884373Ad12cd91c8C868F1DE9DA48501F) converts DAI into AZTEC note form and is live on the Ethereum main-net. [Here is an example AZTEC join-split transaction](https://etherscan.io/tx/0x6cb6bccb6d51445ce026dd76b8526e8014a6a276255d22e4f5be26f8efb891fb).

## What is the future of the AZTEC protocol?

AZTEC will provide efficient and easy to use transaction privacy to the next generation of digital asset builders. We will be releasing the following information, open source technology and protocol upgrades over the coming months:

1. Release the full AZTEC token standard, with associated API tools to construct confidential transactions
2. Release our multiparty computation trusted setup protocol and register participants
3. Release the formal specification for the AZTEC decentralized exchange and example smart contracts
4. Release API tools to use the AZTEC decentralized exchange


## Range proofs you say? How does that work?

Read the AZTEC paper [here](https://github.com/AZTECProtocol/AZTEC/blob/master/AZTEC.pdf). The unique AZTEC commitment function enables the efficient construction and verification of range proofs. The protocol requires a trusted setup protocol, that generates a dataset that is required to construct AZTEC zero-knowledge proofs

### The Trusted Setup

Our proof of concept uses a trusted setup generated by our team internally. Whilst we would like to think you can trust us implicitly, we have developed a method of performing the trusted setup via multiparty computation. Each participant generates a piece of *toxic waste* that must be destroyed. Only *one* participant must destroy their toxic waste for the protocol to be secure and the trusted setup process can scale indefinitely. We will be releasing our full specification for the trusted setup protocol shortly.

## Are AZTEC transactions anonymous as well as confidential?

The AZTEC protocol supports a stealth address protocol that can be used to obfuscate the link between a note 'owner' and any on-chain identity.  
  
## This sounds interesting! How can I get involved?  

Anybody wishing to become early members of the AZTEC network please get in touch at hello@aztecprotocol.com
