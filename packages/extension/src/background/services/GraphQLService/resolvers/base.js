import BigInt from 'apollo-type-bigint';
import accountModel from '~database/models/account';
import EventService from '~/background/services/EventService';
import getViewingKeyFromMetadata from './utils/getViewingKeyFromMetadata';
import getDecryptedViewingKeyFromMetadata from './utils/getDecryptedViewingKeyFromMetadata';
import getAssetBalance from './utils/getAssetBalance';

const getAsset = async (id) => {
    if (typeof id !== 'string') {
        return id;
    }
    const {
        asset,
    } = await EventService.fetchAsset({ address: id });
    return asset;
};

export default {
    BigInt: new BigInt('bigInt'),
    Note: {
        asset: async ({ asset }) => getAsset(asset),
        owner: async ({ owner }) => (typeof owner === 'string' && accountModel.get({ key: owner })) || owner,
        viewingKey: async ({ metadata }) => getViewingKeyFromMetadata(metadata),
        decryptedViewingKey: async ({ metadata, owner }) => getDecryptedViewingKeyFromMetadata(
            metadata,
            owner,
        ),
    },
    Asset: {
        balance: async ({ address }) => getAssetBalance(address),
    },
    GrantNoteAccessPermission: {
        asset: async ({ asset }) => getAsset(asset),
    },
    Query: {},
    Mutation: {},
};
