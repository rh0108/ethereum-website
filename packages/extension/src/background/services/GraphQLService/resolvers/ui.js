import assetModel from '~database/models/asset';
import AuthService from '~background/services/AuthService';
import {
    ensureKeyvault,
    ensureAccount,
    ensureDomainPermission,
} from '../decorators';
import ClientSubscriptionService from '~background/services/ClientSubscriptionService';
import mergeResolvers from './utils/mergeResolvers';
import filterStream from '~utils/filterStream';
import { randomId } from '~utils/random';
import syncUserInfo from './utils/syncUserInfo';
import base from './base';
import ClientConnection from '../../../../ui/services/ClientConnectionService';

const uiResolvers = {
    Asset: {
        // TODO use RXJS connection
        balance: async (_, { address }, ctx, info) => {
            const requestId = randomId();
            ClientConnection.backgroundPort.postMessage({
                requestId,
                type: 'UI_QUERY_REQUEST',
                data: {
                    ...info,
                },
            });
            const response = await filterStream('UI_QUERY_RESPONSE', requestId, ClientConnection.background$);
            return response.balance;
        },
    },
    Mutation: {
        registerExtension: async (_, args) => ({
            account: await AuthService.registerExtension(args),
        }),
        registerAddress: ensureKeyvault(async (_, args) => ({
            account: await AuthService.registerAddress({
                address: args.address,
                linkedPublicKey: args.linkedPublicKey,
                spendingPublicKey: args.spendingPublicKey,
                blockNumber: args.blockNumber,
            }),
        })),
        login: ensureAccount(async (_, args) => ({
            session: await AuthService.login(args),
        })),
        registerDomain: ensureAccount(async (_, args) => {
            console.log(args);
            await AuthService.registerDomain(args.domain);
            return {
                success: true,
            };
        }),
    },
    Query: {
        subscribe: ensureDomainPermission(async (_, args) => ({
            success: ClientSubscriptionService.grantSubscription(args),
        })),
        // TODO use RXJS connection
        pickNotesFromBalance: ensureDomainPermission(async (_, args, ctx, info) => {
            const requestId = randomId();
            ClientConnection.backgroundPort.postMessage({
                requestId,
                type: 'UI_QUERY_REQUEST',
                data: {
                    query: 'asset.pickNotesFromBalance',
                    args,
                },
            });

            const { response } = await filterStream('UI_QUERY_RESPONSE', requestId, ClientConnection.background$);
            return {
                notes: response.notes,
            };
        }),
    },
};

export default mergeResolvers(
    base,
    uiResolvers,
);
