import gql from 'graphql-tag';
import insertVariablesToGql from '~/utils/insertVariablesToGql';
import Web3Service from '~/helpers/Web3Service';
import GraphQLService from '~/background/services/GraphQLService';

export default async function query(request, Query) {
    const {
        domain,
        data: {
            args,
        } = {},
    } = request;
    const {
        address,
    } = Web3Service.account || {};

    let queryTag;
    if (typeof Query !== 'string') {
        queryTag = Query;
    } else {
        const fullQuery = insertVariablesToGql(
            Query,
            {
                ...args,
                domain,
                currentAddress: address,
            },
        );
        queryTag = gql(`query {${fullQuery}}`);
    }

    let data;
    let errorResponse;
    try {
        ({ data } = await GraphQLService.query({
            query: queryTag,
            variables: {
                ...args,
                domain,
                currentAddress: address,
            },
        }) || {});
    } catch (e) {
        errorResponse = e;
    }

    return errorResponse || data;
}
