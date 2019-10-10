import Web3Service from '~helpers/NetworkService';
import {
    IZkAssetConfig,
} from '~config/contracts';
import {
    errorLog,
} from '~utils/log';
import decodeNoteLogs from './helpers/decodeNoteLogs';


const subscribe = async ({
    owner,
    fromBlock,
    networkId,
    fromAssets = null,
} = {}) => {
    if (!networkId && networkId !== 0) {
        errorLog("'networkId' cannot be empty in assets subscription");
        return null;
    }

    const {
        abi,
        subscribe: subscribeOn,
    } = (await Web3Service()).eth;

    const eventsTopics = [
        IZkAssetConfig.events.createNote,
        IZkAssetConfig.events.destroyNote,
        IZkAssetConfig.events.updateNoteMetaData,
    ]
        .map(e => IZkAssetConfig.config.abi.find(({ name, type }) => name === e && type === 'event'))
        .map(abi.encodeEventSignature);

    const ownerTopics = owner ? abi.encodeParameter('address', owner) : null;

    const options = {
        fromBlock,
        address: fromAssets,
        topics: [
            eventsTopics,
            ownerTopics,
        ],
    };

    const subscription = subscribeOn('logs', options, (error) => {
        if (error) {
            errorLog(error);
        }
    });

    return {
        subscription,
        onData: (callback) => {
            subscription.on('data', (event) => {
                const decodedLogs = decodeNoteLogs(eventsTopics, [event], networkId);
                callback(decodedLogs);
            });
        },
        onError: (callback) => {
            subscription.on('error', (error) => {
                callback(error);
            });
        },
    };
};

const unsubscribe = async (subscription) => {
    try {
        await new Promise((resolve, reject) => {
            subscription.unsubscribe((error, success) => {
                if (success) {
                    resolve();
                } else {
                    reject(error);
                }
            });
        });
        return {
            error: null,
            subscription,
        };
    } catch (error) {
        return {
            error,
            subscription,
        };
    }
};

export default {
    subscribe,
    unsubscribe,
};
