import React from 'react';
import PropTypes from 'prop-types';
import {
    Block,
    Text,
} from '@aztec/guacamole-ui';
import {
    assetShape,
} from '~ui/config/propTypes';
import i18n from '~ui/helpers/i18n';
import formatAddress from '~ui/utils/formatAddress';
import formatNumber from '~ui/utils/formatNumber';
import PopupContent from '~ui/components/PopupContent';
import Ticket from '~ui/components/Ticket';
import ListRow from '~ui/components/ListRow';
import ListItem from '~ui/components/ListItem';
import Separator from '~ui/components/Separator';
import InplacePopup from '~ui/components/InplacePopup';

const SendConfirm = ({
    asset,
    sender,
    transactions,
    totalAmount,
}) => (
    <PopupContent
        title={(
            <div>
                <Text
                    text={i18n.t('send.confirm.sendAmount')}
                    size="xl"
                    weight="light"
                />
                <Block padding="0 s" inline>
                    <Text
                        text={formatNumber(totalAmount, asset.decimals)}
                        size="xl"
                        weight="bold"
                    />
                </Block>
                <Text
                    text={asset.name || i18n.t('asset.zkNotes')}
                    size="xl"
                    weight="light"
                />
            </div>
        )}
    >
        <Block padding="m 0">
            <Ticket
                height={2}
                align="center"
            >
                <Block align="left">
                    <ListRow
                        title={i18n.t('asset.send.from')}
                        content={(
                            <ListItem
                                profile={{
                                    type: 'user',
                                    address: sender,
                                }}
                                content={formatAddress(sender, 16, 6)}
                                size="xxs"
                                textSize="xs"
                            />
                        )}
                    />
                    <ListRow
                        title={i18n.t('asset')}
                        content={(
                            <ListItem
                                profile={{
                                    ...asset,
                                    type: 'asset',
                                }}
                                content={asset.name
                                    ? `${asset.name} (${formatAddress(asset.address, 6, 4)})`
                                    : formatAddress(asset.address, 16, 6)
                                }
                                size="xxs"
                                textSize="xs"
                            />
                        )}
                    />
                    <ListRow
                        title={i18n.t('deposit.amount.total')}
                        content={(
                            <Text
                                text={formatNumber(totalAmount, asset.decimals)}
                                size="xs"
                                contentSize="s"
                                color="green"
                            />
                        )}
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
                            content={formatAddress(to, 12, 6)}
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
                    text={i18n.t('send.confirm.explain')}
                    size="xs"
                />
            </Block>
        </Block>
    </PopupContent>
);

SendConfirm.propTypes = {
    asset: assetShape.isRequired,
    sender: PropTypes.string.isRequired,
    transactions: PropTypes.arrayOf(PropTypes.shape({
        amount: PropTypes.number.isRequired,
        to: PropTypes.string.isRequired,
    })).isRequired,
    totalAmount: PropTypes.number.isRequired,
};

export default SendConfirm;
