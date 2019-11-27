import React from 'react';
import PropTypes from 'prop-types';
import {
    Row,
    Col,
    Block,
    Text,
} from '@aztec/guacamole-ui';
import i18n from '~ui/helpers/i18n';
import formatNumber from '~ui/utils/formatNumber';
import ProfileIcon from '~ui/components/ProfileIcon';
import Button from '~ui/components/Button';

const AssetSummary = ({
    className,
    address,
    linkedTokenAddress,
    icon,
    name,
    decimals,
    balance,
}) => (
    <Block
        className={className}
        padding="xl"
        background="white-lightest"
        borderRadius="xs"
    >
        <ProfileIcon
            type="asset"
            address={address}
            linkedTokenAddress={linkedTokenAddress}
            src={icon}
            size="l"
        />
        <Block top="m">
            <Text
                text={name}
                size="m"
            />
        </Block>
        <Block padding="m 0">
            <Text
                text={formatNumber(balance, decimals)}
                size="l"
                weight="semibold"
            />
        </Block>
        <Block top="s">
            <Row margin="s">
                <Col column={6} margin="s">
                    <Button
                        text={i18n.t('asset.deposit')}
                        rounded={false}
                        theme="white"
                        outlined
                        expand
                    />
                </Col>
                <Col column={6} margin="s">
                    <Button
                        text={i18n.t('asset.send')}
                        rounded={false}
                        theme="white"
                        outlined
                        expand
                    />
                </Col>
            </Row>
        </Block>
    </Block>
);

AssetSummary.propTypes = {
    className: PropTypes.string,
    address: PropTypes.string.isRequired,
    linkedTokenAddress: PropTypes.string.isRequired,
    icon: PropTypes.string,
    name: PropTypes.string,
    decimals: PropTypes.number.isRequired,
    balance: PropTypes.number.isRequired,
};

AssetSummary.defaultProps = {
    className: '',
    name: '',
    icon: '',
};

export default AssetSummary;
