import React from 'react';
import PropTypes from 'prop-types';
import { KeyStore } from '~utils/keyvault';
import ActionService from '~ui/services/ActionService';
import CombinedViews from '~ui/views/handlers/CombinedViews';
import Intro from '../RegisterIntro';
import BackupKeys from '../BackupKeys';
import ConfirmBackupKeys from '../ConfirmBackupKeys';
import CreatePassword from '../CreatePassword';
import RegisterAddress from '../RegisterAddress';

const Steps = [
    Intro,
    BackupKeys,
    ConfirmBackupKeys,
    CreatePassword,
    RegisterAddress,
];

const handleGoBack = (step, prevData) => {
    let data = prevData;
    switch (step) {
        case 1: {
            data = { ...data };
            delete data.seedPhrase;
            break;
        }
        case 3: {
            data = {
                ...data,
                stepOffset: 2,
            };
            break;
        }
        default:
    }

    return data;
};

const handleGoNext = (step, prevData) => {
    let data = prevData;
    switch (step) {
        case 0: {
            data = {
                ...data,
                seedPhrase: KeyStore.generateRandomSeed(Date.now().toString()),
            };
            break;
        }
        default:
    }

    return data;
};

const handleResponse = (response) => {
    console.log('Register successfully!', response);
};

const doRegister = (data) => {
    ActionService
        .post('register', data)
        .onReceiveResponse(handleResponse);
};

const Register = ({
    address,
}) => (
    <CombinedViews
        Steps={Steps}
        initialData={{ address }}
        onGoBack={handleGoBack}
        onGoNext={handleGoNext}
        onExit={doRegister}
    />
);

Register.propTypes = {
    address: PropTypes.string.isRequired,
};

export default Register;
