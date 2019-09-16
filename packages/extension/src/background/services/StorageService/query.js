import Account from '~background/database/models/account'

const account = (networkId, address) => {
    return Account.get({networkId}, address);
};


export default {
    account,
}