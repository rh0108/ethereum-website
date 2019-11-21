import Web3Service from '~/helpers/Web3Service';
import {
    AZTECAccountRegistry,
} from '~config/contracts';

export default async function fetchAccount({
    address,
} = {}) {
    if (!address) {
        return {
            error: new Error("'address' cannot be empty in fetchAccount"),
            account: null,
        };
    }

    const eventName = AZTECAccountRegistry.events.registerExtension;

    const options = {
        filter: {
            account: address,
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
    };

    try {
            .useContract(AZTECAccountRegistry.name)
        const data = await Web3Service
            .events(eventName)
            .where(options);

        const accounts = data.map(({
            blockNumber,
            returnValues: {
                linkedPublicKey,
                spendingPublicKey,
            },
        }) => ({
            address,
            blockNumber,
            linkedPublicKey,
            spendingPublicKey,
        }));

        const account = accounts.length ? accounts[accounts.length - 1] : null;

        return {
            error: null,
            account,
        };
    } catch (error) {
        return {
            error,
            account: null,
        };
    }
}
