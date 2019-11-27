import React from 'react';
import PropTypes from 'prop-types';
import {
    ADDRESS_LENGTH,
} from '~/config/constants';
import {
    randomId,
} from '~/utils/random';
import DomainPermissionTransaction from '~/ui/views/DomainPermissionTransaction';
import AnimatedTransaction from '~/ui/views/handlers/AnimatedTransaction';
import apis from '~uiModules/apis';

const steps = [
    {
        titleKey: 'domain.permission.title',
        tasks: [
            {
                type: 'auth',
                name: 'create',
                run: apis.auth.approveDomain,
            },
        ],
        content: DomainPermissionTransaction,
        submitTextKey: 'domain.permission.submit',
    },
];

const DomainPermission = ({
    domain,
}) => {
    const fetchInitialData = async () => {
        const assets = await apis.asset.getDomainAssets(domain.domain);
        const assetPlaceholders = assets && assets.length > 0
            ? []
            : [...Array(3)].map(() => ({
                address: `0x${randomId(ADDRESS_LENGTH)}`,
                linkedTokenAddress: `0x${randomId(ADDRESS_LENGTH)}`,
            }));

        return {
            domain,
            assets,
            assetPlaceholders,
        };
    };

    return (
        <AnimatedTransaction
            steps={steps}
            fetchInitialData={fetchInitialData}
        />
    );
};

DomainPermission.propTypes = {
    domain: PropTypes.shape({
        domain: PropTypes.string.isRequired,
    }).isRequired,
};

export default DomainPermission;
