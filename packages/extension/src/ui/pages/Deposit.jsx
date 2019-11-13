import React from 'react';
import PropTypes from 'prop-types';
import {
    proofs,
} from '@aztec/dev-utils';
import {
    emptyIntValue,
} from '~/ui/config/settings';
import makeAsset from '~uiModules/utils/asset';
import apis from '~uiModules/apis';
import returnAndClose from '~ui/helpers/returnAndClose';
import AnimatedTransaction from '~ui/views/handlers/AnimatedTransaction';
import DepositConfirm from '~ui/views/DepositConfirm';
import DepositApprove from '~ui/views/DepositApprove';
import DepositSend from '~ui/views/DepositSend';

const steps = [
    {
        titleKey: 'deposit.confirm.title',
        tasks: [
            {
                name: 'proof',
                run: apis.proof.deposit,
            },
        ],
        content: DepositConfirm,
        submitTextKey: 'deposit.confirm.submit',
    },
    {
        titleKey: 'deposit.approve.title',
        tasks: [
            {
                type: 'sign',
                name: 'approve',
                run: apis.ace.publicApprove,
            },
        ],
        content: DepositApprove,
        submitTextKey: 'deposit.approve.submit',
    },
    {
        titleKey: 'deposit.send.title',
        tasks: [
            {
                name: 'send',
                run: apis.asset.confidentialTransfer,
            },
        ],
        content: DepositSend,
        submitTextKey: 'deposit.send.submit',
    },
];

const handleOnStep = (step) => {
    const newProps = {};
    switch (step) {
        case 1:
            break;
        default:
    }

    return newProps;
};

const Deposit = ({
    initialStep,
    from,
    sender,
    assetAddress,
    transactions,
    numberOfOutputNotes,
}) => {
    const fetchInitialData = async () => {
        const asset = await makeAsset(assetAddress);
        const amount = transactions.reduce((sum, t) => sum + t.amount, 0);

        return {
            asset,
            from,
            sender,
            amount,
            transactions,
            numberOfOutputNotes,
        };
    };

    return (
        <AnimatedTransaction
            initialStep={initialStep}
            steps={steps}
            fetchInitialData={fetchInitialData}
            initialData={
                {
                    assetAddress,
                    owner: from,
                    publicOwner: from,
                    transactions,
                    sender,
                    numberOfOutputNotes,
                    signatures: '0x',
                    proofId: proofs.JOIN_SPLIT_PROOF,
                }
            }
            onExit={returnAndClose}
            onStep={handleOnStep}
        />
    );
};

Deposit.propTypes = {
    initialStep: PropTypes.number,
    from: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    assetAddress: PropTypes.string.isRequired,
    transactions: PropTypes.arrayOf(PropTypes.shape({
        amount: PropTypes.number.isRequired,
        to: PropTypes.string.isRequired,
    })).isRequired,
    numberOfOutputNotes: PropTypes.number,
};

Deposit.defaultProps = {
    initialStep: 0,
    numberOfOutputNotes: emptyIntValue,
};

export default Deposit;
