import React from 'react';
import PropTypes from 'prop-types';
import {
    Route,
} from 'react-router-dom';
import {
    siteShape,
    gsnConfigShape,
} from '~/ui/config/propTypes';
import Popup from '~ui/components/Popup';

const CustomRoute = ({
    path,
    currentAccount,
    action,
    Component,
    gsnConfig,
    goToPage,
}) => {
    const {
        id: actionId,
        site,
        data,
    } = action || {};

    return (
        <Route
            path={path}
            component={() => (
                <Popup site={site}>
                    <Component
                        {...data}
                        gsnConfig={gsnConfig}
                        actionId={actionId}
                        currentAccount={currentAccount}
                        goToPage={goToPage}
                    />
                </Popup>
            )}
        />
    );
};

CustomRoute.propTypes = {
    path: PropTypes.string.isRequired,
    currentAccount: PropTypes.shape({
        address: PropTypes.string.isRequired,
        linkedPublicKey: PropTypes.string,
    }).isRequired,
    action: PropTypes.shape({
        id: PropTypes.string.isRequired,
        site: siteShape.isRequired,
        data: PropTypes.object,
    }),
    Component: PropTypes.func.isRequired,
    goToPage: PropTypes.func.isRequired,
    gsnConfig: gsnConfigShape.isRequired,
};

CustomRoute.defaultProps = {
    action: null,
};

export default CustomRoute;
