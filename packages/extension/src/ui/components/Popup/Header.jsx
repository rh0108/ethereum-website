import React from 'react';
import PropTypes from 'prop-types';
import {
    FlexBox,
    Block,
    Text,
    Icon,
    Image,
    Clickable,
} from '@aztec/guacamole-ui';
import {
    siteShape,
} from '~/ui/config/propTypes';
import findOptimalIcon from '~/ui/utils/findOptimalIcon';
import styles from './popup.scss';

const Header = ({
    site,
    onClose,
}) => {
    const {
        title,
        domain,
        icons,
    } = site;
    const icon = findOptimalIcon(icons, { width: 80, height: 80 });

    return (
        <FlexBox
            valign="center"
        >
            <FlexBox
                className={`flex-free-expand ${styles.site}`}
                valign="center"
                nowrap
            >
                {!!icon && (
                    <Block
                        className="flex-fixed"
                        right="s"
                    >
                        <Image
                            className={styles['site-icon']}
                            ratio="square"
                            backgroundUrl={icon.href}
                            borderRadius="s"
                        />
                    </Block>
                )}
                <Block
                    className={styles['site-info']}
                    align="left"
                    right="s"
                >
                    <Text
                        text={title}
                        size="xs"
                        weight="light"
                        showEllipsis
                    />
                    <div>
                        <Text
                            text={domain}
                            size="xxs"
                            color="primary-lighter"
                            showEllipsis
                        />
                    </div>
                </Block>
            </FlexBox>
            {!!onClose && (
                <div className="flex-fixed">
                    <Clickable
                        onClick={onClose}
                    >
                        <Icon
                            name="close"
                            size="xl"
                            color="label"
                        />
                    </Clickable>
                </div>
            )}
        </FlexBox>
    );
};

Header.propTypes = {
    site: siteShape.isRequired,
    onClose: PropTypes.func,
};

Header.defaultProps = {
    onClose: null,
};

export default Header;
