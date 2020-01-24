import ethSigUtil from 'eth-sig-util';
import EthCrypto from 'eth-crypto';
import Web3Service from '~/client/services/Web3Service';
import {
    SIGNING_PROVIDER,
} from '~/config/constants';
import registerExtension from './registerExtension';
import signNote from './signNote';
import batchSignNotes from './batchSignNotes';

const handleAction = async (action, params) => {
    let response = {};
    const { address } = Web3Service.account;

    switch (action) {
        case 'metamask.send': {
            const {
                contract,
                at,
                method,
                data,
            } = params;
            let contractObj = Web3Service.useContract(contract);
            if (at) {
                contractObj = contractObj.at(at);
            }
            response = await contractObj
                .method(method)
                .send(...data);
            break;
        }
        case 'gsn.sign.transaction': {
            const {
                apiKey,
                networkId,
                ...data
            } = params;
            const result = await window.fetch(`${SIGNING_PROVIDER}/Stage/${networkId}/${apiKey}`, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json',
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({ data }), // body data type must match "Content-Type" header
            });
            const {
                data: {
                    approvalData,
                },
            } = await result.json();

            response = { approvalData };
            break;
        }
        case 'metamask.register.extension': {
            const eip712Data = registerExtension(params);
            const method = 'eth_signTypedData_v3';
            const { result } = await Web3Service.sendAsync({
                method,
                params: [address, eip712Data],
                from: address,
            });

            const publicKey = ethSigUtil.extractPublicKey({
                data: eip712Data,
                sig: result,
            });
            const compressedPublicKey = EthCrypto.publicKey.compress(
                publicKey.slice(2),
            );

            response = {
                signature: result,
                publicKey: `0x${compressedPublicKey}`,
            };
            break;
        }
        case 'metamask.eip712.signNotes': {
            const {
                assetAddress,
                noteHashes,
                challenge,
                sender,
            } = params;
            const signatures = (await Promise.all(noteHashes.map(async (noteHash) => {
                const noteSchema = signNote({
                    assetAddress,
                    noteHash,
                    challenge,
                    sender,
                });
                const method = 'eth_signTypedData_v3';
                return Web3Service.sendAsync({
                    method,
                    params: [address, noteSchema],
                    from: address,
                });
            }))).map(({ result }) => result);

            response = {
                signatures,
            };
            break;
        }
        case 'metamask.eip712.batchSignNotes': {
            const {
                assetAddress,
                noteHashes,
                sender,
            } = params;

            const spenderApprovals = noteHashes.map(() => true);

            const noteSchema = batchSignNotes({
                assetAddress,
                noteHashes,
                spenderApprovals,
                spender: sender,
            });
            const method = 'eth_signTypedData_v4';
            const { result } = await Web3Service.sendAsync({
                method,
                params: [address, noteSchema],
                from: address,
            });

            response = {
                signature: result,
            };
            break;
        }
        default:
    }

    return response;
};

export default async function MetaMaskService(query) {
    let response;
    let error;
    try {
        const {
            action,
            params,
        } = query.data;
        response = await handleAction(action, params);
        ({
            error,
        } = response || {});
    } catch (e) {
        error = e;
    }

    return {
        ...query,
        response: {
            ...response,
            error,
            success: !error,
        },
    };
}
