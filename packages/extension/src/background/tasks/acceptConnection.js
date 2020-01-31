import {
    connectionRequestEvent,
    connectionApprovedEvent,
    backgroundReadyEvent,
    uiCloseEvent,
} from '~/config/event';
import {
    getResourceUrl,
} from '~/utils/versionControl';
import {
    permissionError,
} from '~/utils/error';
import Connection from '../utils/connection';
import setupNetworkConfig from './setupNetworkConfig';

const resourceOrigin = getResourceUrl('origin');

export default function acceptConnection() {
    window.parent.postMessage({
        type: backgroundReadyEvent,
    }, '*');

    const connection = Connection;
    let networkConfig;

    window.addEventListener('message', async (event) => {
        if (event.data.type === connectionRequestEvent) {
            const {
                clientProfile,
            } = event.data;

            if (clientProfile) {
                try {
                    networkConfig = await setupNetworkConfig(clientProfile);
                    connection.initUi();
                } catch (e) {
                    const error = e.code === 4001
                        ? permissionError('user.denied.auth')
                        : e;
                    networkConfig = {
                        error,
                    };
                }
            } else if (event.origin !== resourceOrigin) {
                return;
            }

            const channel = new MessageChannel();
            const {
                data,
            } = event;

            connection.registerClient({
                data,
                port: channel.port1,
            });

            event.source.postMessage({
                type: connectionApprovedEvent,
                code: '200',
                data: networkConfig,
            }, '*', [channel.port2]);
        }
    });

    window.addEventListener(uiCloseEvent, (e) => {
        const {
            detail,
        } = e;
        connection.abortUi(detail);
    });
}
