import {
    warnLogProduction,
} from '~/utils/log';
import {
    argsError,
} from '~/utils/error';
import ensureInputNotes from '../utils/ensureInputNotes';
import validateAccounts from '../utils/validateAccounts';

export default async function verifyWithdrawRequest({
    assetAddress,
    amount,
    to,
    numberOfInputNotes,
    returnProof,
    sender,
}) {
    if (sender && !returnProof) {
        warnLogProduction(argsError('input.returnProof.only', {
            args: 'sender',
        }));
    }

    const noteError = await ensureInputNotes({
        assetAddress,
        numberOfInputNotes,
        amount,
    });
    if (noteError) {
        return noteError;
    }

    const invalidAddressError = await validateAccounts([to]);
    if (invalidAddressError) {
        return invalidAddressError;
    }

    return null;
}
