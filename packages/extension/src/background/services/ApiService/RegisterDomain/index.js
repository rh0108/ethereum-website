import filterStream from '~utils/filterStream';
import AuthService from '../../AuthService';

const registerDomain = async (query, connection) => {
    const registeredDomain = await AuthService.getRegisteredDomain(query.domain);

    if (!registeredDomain) {
        const {
            webClientId,
        } = query;
        const senderPort = connection.connections[webClientId];
        if (!senderPort) {
            return null;
        }

        const {
            favIconUrl,
            title,
            url,
        } = senderPort.sender.tab;

        connection.UiActionSubject.next({
            type: 'ui.domain.approve',
            requestId: query.requestId,
            clientId: query.clientId,
            data: {
                response: {
                    domain: {
                        iconSrc: favIconUrl,
                        name: title,
                        domain: query.domain,
                        url,
                        ...query.data.metadata,
                    },
                    ...query.args,
                },
                requestId: query.requestId,
            },
        });
        return filterStream('UI_RESPONSE', query.requestId, connection.MessageSubject.asObservable());
    }
    return registeredDomain;
};


export default async (query, connection) => {
    const response = await registerDomain(query, connection);
    return {
        ...query,
        response,
    };
};
