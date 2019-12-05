import React from 'react';
import PropTypes from 'prop-types';
import {
    Block,
    Text,
} from '@aztec/guacamole-ui';
import i18n from '~ui/helpers/i18n';
import {
    assetShape,
    transactionShape,
} from '~/ui/config/propTypes';
import formatNumber from '~ui/utils/formatNumber';
import PopupContent from '~ui/components/PopupContent';
import Ticket from '~ui/components/Ticket';
import ListRow from '~ui/components/ListRow';
import ListItem from '~ui/components/ListItem';
import HashText from '~/ui/components/HashText';
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
                                content={(
                                    <HashText
                                        text={fromAddress}
                                        prefixLength={12}
                                        suffixLength={4}
                                        size="s"
                                    />
                                )}
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
                                content={(
                                    <Text
                                        size="xxs"
                                        color="secondary"
                                    >
                                        {asset.name ? `${asset.name} (` : ''}
                                        <HashText
                                            text={asset.address}
                                            prefixLength={12}
                                            suffixLength={4}
                                            size="s"
                                        />
                                        {asset.name ? ')' : ''}
                                    </Text>
                                )}
                                size="xxs"
                                textSize="xs"
                            />
                        )}
                    />
                    <ListRow
                        title={i18n.t('deposit.amount.total')}
                        content={formatNumber(totalAmount, asset.decimals)}
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
                            content={(
                                <HashText
                                    text={to}
                                    prefixLength={12}
                                    suffixLength={4}
                                />
                            )}
                            size="xxs"
                            footnote={(
                                <Text
                                    text={`+${formatNumber(amount, asset.decimals)}`}
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
    asset: assetShape.isRequired,
    from: PropTypes.string.isRequired,
    transactions: PropTypes.arrayOf(transactionShape).isRequired,
    amount: PropTypes.number.isRequired,
};

export default DepositConfirm;
