import {
    get,
} from '~/utils/storage';
import Web3Service from '~helpers/NetworkService';


const sendTransaction = async (data) => {
    const {
        data: {
            responseId,
            data: {
                contract,
                method,
                params,
            },
        },
    } = data;

    const networkId = await get('networkId');
    const web3Service = await Web3Service({
        networkId,
    });

    try {
        const useGSN = true;
        const receipt = await web3Service
            .useContract(contract)
            .method(method, useGSN)
            .send(...params);
        return {
            ...data,
            data: {
                response: {
                    txReceipt: receipt,
                },
            },
            responseId,
        };
    } catch (e) {
        console.error('GSN service error: ', e);
    }

    return null;
};

// TODO change this to use the gas station network

export default {
    sendTransaction,
};
