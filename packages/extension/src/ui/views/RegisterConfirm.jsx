import React from 'react';
import PropTypes from 'prop-types';
import {
    Block,
    Text,
    SVG,
} from '@aztec/guacamole-ui';
import i18n from '~/ui/helpers/i18n';
import sendGlyph from '~/ui/images/send.svg';
import ListItem from '~/ui/components/ListItem';
import PopupContent from '~/ui/components/PopupContent';
import HashText from '~/ui/components/HashText';

const RegisterConfirm = ({
    address,
    linkedPublicKey,
}) => (
    <PopupContent
        descriptionKey="register.confirm.blurb"
    >
        <Block padding="s 0">
            <SVG
                glyph={sendGlyph}
                width={70}
                height={70}
            />
        </Block>
        <Block padding="s 0">
            <Block padding="xs 0">
                <Block
                    padding="l"
                    borderRadius="s"
                    background="white-lighter"
                >
                    <ListItem
                        content={`${i18n.t('account.address')}:`}
                        size="xs"
                        weight="light"
                        footnote={(
                            <HashText
                                text={address}
                                prefixLength={18}
                                suffixLength={6}
                                size="xs"
                                color="label"
                            />
                        )}
                    />
                    <ListItem
                        content={`${i18n.t('account.linkedPublicKey')}:`}
                        size="xs"
                        weight="light"
                        footnote={(
                            <HashText
                                text={linkedPublicKey}
                                prefixLength={12}
                                suffixLength={4}
                                size="xs"
                                color="label"
                            />
                        )}
                    />
                </Block>
            </Block>
            <Block padding="xs m">
                <Text
                    text={i18n.t('register.confirm.explain')}
                    size="s"
                />
            </Block>
        </Block>
    </PopupContent>
);

RegisterConfirm.propTypes = {
    address: PropTypes.string.isRequired,
    linkedPublicKey: PropTypes.string.isRequired,
};

export default RegisterConfirm;
