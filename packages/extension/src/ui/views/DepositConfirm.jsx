import React from 'react';
import PropTypes from 'prop-types';
import {
    Block,
    Text,
} from '@aztec/guacamole-ui';
import i18n from '~ui/helpers/i18n';
import {
    formatValue,
} from '~ui/utils/asset';
import formatAddress from '~ui/utils/formatAddress';
import PopupContent from '~ui/components/PopupContent';
import Ticket from '~ui/components/Ticket';
import ListRow from '~ui/components/ListRow';
import ListItem from '~ui/components/ListItem';
import Separator from '~ui/components/Separator';
import InplacePopup from '~ui/components/InplacePopup';

const DepositConfirm = ({
    asset,
    from: fromAddress,
    transactions,
    amount: totalAmount,
}) => (
    <PopupContent>
        <Block padding="m 0">
            <Ticket
                align="center"
                height={3}
            >
                <Block align="left">
                    <ListRow
                        title={i18n.t('deposit.from')}
                        content={(
                            <ListItem
                                className="text-code"
                                profile={{
                                    type: 'user',
                                    address: fromAddress,
                                }}
                                content={<Text text={formatAddress(fromAddress, 10, 4)} size="xs" />}
                                size="xxs"
                                textSize="xs"
                            />
                        )}
                    />
                    <ListRow
                        title={i18n.t('asset')}
                        content={(
                            <ListItem
                                className="text-code"
                                profile={{
                                    ...asset,
                                    type: 'asset',
                                }}
                                content={<Text text={formatAddress(asset.address, 10, 4)} size="xs" color="secondary" />}
                                size="xxs"
                                textSize="xs"
                            />
                        )}
                    />
                    <ListRow
                        title={i18n.t('deposit.amount.total')}
                        content={formatValue(asset.code, totalAmount)}
                        size="xs"
                        contentSize="s"
                        color="green"
                    />
                </Block>
            </Ticket>
        </Block>
        <Block padding="m xl">
            <Separator
                theme="white"
                title={i18n.t('to')}
            />
            <Block padding="m 0">
                <InplacePopup
                    theme="white"
                    items={transactions}
                    renderItem={({
                        amount,
                        to,
                    }) => (
                        <ListItem
                            className="text-code"
                            profile={{
                                type: 'user',
                                address: to,
                            }}
                            content={formatAddress(to, 12, 4)}
                            size="xxs"
                            footnote={(
                                <Text
                                    text={`+${formatValue(asset.code, amount)}`}
                                    color="green"
                                />
                            )}
                        />
                    )}
                    itemMargin="xs 0"
                    margin="xs m"
                    numberOfVisibleItems={2}
                />
            </Block>
            <Block padding="m 0">
                <Text
                    text={i18n.t('deposit.confirm.explain')}
                    size="xs"
                />
            </Block>
        </Block>
    </PopupContent>
);

DepositConfirm.propTypes = {
    asset: PropTypes.shape({
        address: PropTypes.string.isRequired,
        code: PropTypes.string,
    }).isRequired,
    from: PropTypes.string.isRequired,
    transactions: PropTypes.arrayOf(PropTypes.shape({
        amount: PropTypes.number.isRequired,
        to: PropTypes.string.isRequired,
    })).isRequired,
    amount: PropTypes.number.isRequired,
};

export default DepositConfirm;