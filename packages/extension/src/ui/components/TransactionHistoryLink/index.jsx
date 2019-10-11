import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
    Block,
    FlexBox,
    Text,
    Icon,
} from '@aztec/guacamole-ui';
import {
    assetShape,
} from '~ui/config/propTypes';
import {
    formatValue,
} from '~ui/utils/asset';
import formatAddress from '~ui/utils/formatAddress';
import SummaryLink from '~ui/components/SummaryLink';
import styles from './link.scss';

const typeIconMapping = {
    deposit: {
        name: 'double_arrow',
    },
    send: {
        name: 'double_arrow',
        flipHorizontal: true,
    },
    withdraw: {
        name: 'double_arrow',
        flipHorizontal: true,
    },
};

const TransactionHistoryLink = ({
    className,
    type,
    asset,
    address,
    value,
    timestamp,
    onClick,
}) => (
    <div className={className}>
        <SummaryLink
            profile={{
                type: 'asset',
                address: asset.address,
                tokenAddress: asset.tokenAddress,
            }}
            onClick={onClick}
        >
            <FlexBox
                align="space-between"
                valign="center"
            >
                <FlexBox valign="center">
                    <Icon
                        {...typeIconMapping[type]}
                        size="l"
                    />
                    <Block padding="0 m">
                        <Text
                            text={formatValue(asset.code, value)}
                        />
                    </Block>
                </FlexBox>
                <Block right="m">
                    <Text
                        className="text-code"
                        text={`(${formatAddress(address, 6, 4)})`}
                        size="xxs"
                        color="white-light"
                    />
                </Block>
            </FlexBox>
        </SummaryLink>
        <Block
            top="xxs"
            right="m"
            align="right"
        >
            <Text
                className={styles.timestamp}
                text={moment(timestamp).fromNow()}
                weight="light"
                color="white-lighter"
            />
        </Block>
    </div>
);

TransactionHistoryLink.propTypes = {
    className: PropTypes.string,
    type: PropTypes.oneOf([
        'deposit',
        'send',
        'withdraw',
    ]).isRequired,
    asset: assetShape.isRequired,
    address: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    timestamp: PropTypes.number.isRequired,
    onClick: PropTypes.func,
};

TransactionHistoryLink.defaultProps = {
    className: '',
    onClick: null,
};

export default TransactionHistoryLink;
