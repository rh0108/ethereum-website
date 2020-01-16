import ClientSubscriptionService from '~/background/services/ClientSubscriptionService';
import userModel from '~/database/models/user';
import {
    ensureKeyvault, // TODO rename this also checks session
    ensureDomainPermission,
} from '../decorators';
import mergeResolvers from './utils/mergeResolvers';
import syncUserInfo from './utils/syncUserInfo';
import getAccounts from './utils/getAccounts';
import Web3Service from '~/helpers/Web3Service';
import NoteService from '~/background/services/NoteService';
import fetchAsset from './utils/fetchAsset';
import fetchAztecAccount from './utils/fetchAztecAccount';
import pickNotesFromBalance from './utils/pickNotesFromBalance';
import syncNoteInfo from './utils/syncNoteInfo';
import base from './base';

const backgroundResolvers = {
    Query: {
        user: ensureDomainPermission(async (_, args) => ({
            account: await userModel.get({
                id: (args.id || args.currentAddress),
            }),
        })),
        asset: ensureDomainPermission(async (_, args) => fetchAsset({
            address: args.id || args.address,
        })),
        note: ensureDomainPermission(async (_, args, ctx) => ({
            note: await syncNoteInfo(args, ctx),
        })),
        pickNotesFromBalance: ensureDomainPermission(async (_, args, ctx) => ({
            notes: await pickNotesFromBalance(args, ctx),
        })),
        fetchNotesFromBalance: ensureDomainPermission(async (_, args, ctx) => ({
            notes: await NoteService.fetch(
                Web3Service.networkId,
                ctx.user.address,
                args.assetAddress,
                {
                    equalTo: args.equalTo,
                    greaterThan: args.greaterThan,
                    lessThan: args.lessThan,
                    numberOfNotes: args.numberOfNotes,
                },
            ),
        })),
        account: ensureDomainPermission(async (_, args) => fetchAztecAccount({
            address: args.currentAddress,
        })),
        accounts: ensureDomainPermission(async (_, args, ctx) => ({
            accounts: await getAccounts(args, ctx),
        })),
        subscribe: ensureDomainPermission(async (_, args) => ({
            success: ClientSubscriptionService.grantSubscription(args),
        })),
        userPermission: ensureKeyvault(async (_, args, ctx) => ({
            account: await syncUserInfo(args, ctx),
        })),
    },
};

export default mergeResolvers(
    base,
    backgroundResolvers,
);
