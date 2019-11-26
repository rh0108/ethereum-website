import {
    from,
    Subject,
    merge,
} from 'rxjs';
import {
    mergeMap,
    tap,
    map,
    filter,
} from 'rxjs/operators';
import {
    clientRequestEvent,
    clientResponseEvent,
    clientDisconnectEvent,
    actionRequestEvent,
    sendTransactionEvent,
    uiReadyEvent,
    uiOpenEvent,
    uiCloseEvent,
    sendActionEvent,
    sendQueryEvent,
} from '~config/event';
import urls from '~config/urls';
import Iframe from '~/utils/Iframe';
import {
    warnLog,
} from '~/utils/log';
import {
    permissionError,
} from '~/utils/error';
import getDomainFromUrl from '~/utils/getDomainFromUrl';
import graphQueryMap from '../../ui/queries';
import ApiService from '../services/ApiService';
import ClientActionService from '../services/ClientActionService';
import TransactionSendingService from '../services/TransactionSendingService';
import GraphQLService from '../services/GraphQLService';

class Connection {
    constructor() {
        this.connections = {};
        this.requests = {};

        this.MessageSubject = new Subject();
        this.message$ = this.MessageSubject.asObservable();

        this.UiActionSubject = new Subject();
        this.ui$ = this.UiActionSubject.asObservable();

        this.UiResponseSubject = new Subject();
        this.uiResponse$ = this.UiResponseSubject.asObservable();

        this.GraphSubject = new Subject();
        this.graph$ = this.GraphSubject.asObservable();

        this.ClientResponseSubject = new Subject();
        this.clientResponse$ = this.ClientResponseSubject.asObservable();

        this.ClientActionSubject = new Subject();
        this.clientAction$ = this.ClientActionSubject.asObservable();

        this.containerId = 'aztec-popup-ui';
        this.uiFrame = new Iframe({
            id: 'AZTECSDK-POPUP',
            src: urls.ui,
            width: '100%',
            height: '100%',
            onReadyEventName: uiReadyEvent,
            containerId: this.containerId,
        });

        // send the messages to the client
        merge(this.clientAction$, this.clientResponse$).pipe(
            tap(({ webClientId, ...rest }) => {
                console.log({ rest });
                if (!this.connections[webClientId]) {
                    warnLog(`Cannot find web client '${webClientId}'.`);
                    return;
                }
                this.connections[webClientId].postMessage(rest);
            }),
        ).subscribe();

        // respond to  the UI
        this.uiResponse$.pipe(
            tap(({ uiClientId, ...rest }) => {
                if (!this.connections[uiClientId]) {
                    warnLog(`Cannot find ui client '${uiClientId}'.`);
                    return;
                }
                this.connections[uiClientId].postMessage(rest);
            }),
        ).subscribe();

        // this stream of events does the following
        // 1. save the action state to the storage so it can be loaded by the UI thread
        // 2. trigger the UI popup

        this.ui$.pipe(
            map(async (action) => {
                const {
                    requestId,
                } = action;

                const loadingElem = document.getElementById('aztec-popup-placeholder');
                loadingElem.style.display = 'block';

                const uiContainer = document.getElementById(this.containerId);
                uiContainer.style.display = 'none';
                uiContainer.innerHTML = ''; // clear previous ui

                const {
                    webClientId,
                } = this.requests[requestId];
                const {
                    site,
                } = action.data;
                const siteData = {
                    ...site,
                    // find domain here so that we don't have to include
                    // the entire 'psl' module to client or background-ui
                    domain: getDomainFromUrl(site.url),
                };

                this.openUi({
                    requestId,
                    webClientId,
                    site: siteData,
                });

                this.ClientResponseSubject.next({
                    type: uiOpenEvent,
                    requestId,
                    webClientId,
                });

                const frame = await this.uiFrame.init();
                frame.contentWindow.postMessage({
                    type: sendActionEvent,
                    action,
                }, '*');
                loadingElem.style.display = 'none';
                uiContainer.style.display = 'block';
                this.uiFrame.open();
            }), // we can extend this to automatically close the window after a timeout
        ).subscribe();

        // this.message$.subscribe();
        // we need to setup a stream that relays messages to the client and back to the UI
        this.message$.pipe(
            // we filter the stream here
            filter(({ type }) => type === actionRequestEvent),
            mergeMap(data => from(ClientActionService.triggerClientAction(data, this))),
            tap(data => this.UiResponseSubject.next(data)),
        ).subscribe();

        this.message$.pipe(
            filter(data => data.type === sendTransactionEvent),
            mergeMap(data => from(TransactionSendingService.sendTransaction(data, this))),
            tap(data => this.UiResponseSubject.next(data)),
        ).subscribe();

        this.message$.pipe(
            filter(data => data.type === uiCloseEvent),
            tap((data) => {
                const {
                    requestId,
                    data: clientData,
                } = data;
                let {
                    webClientId,
                } = data;
                if (!webClientId) {
                    ({
                        webClientId,
                    } = this.requests[requestId]);
                }
                this.closeUi();
                this.ClientResponseSubject.next({
                    type: uiCloseEvent,
                    requestId,
                    webClientId,
                });

                const {
                    abort,
                    error,
                } = clientData;
                if (abort) {
                    this.ClientResponseSubject.next({
                        type: clientResponseEvent,
                        requestId,
                        webClientId,
                        data: error
                            ? { error }
                            : permissionError('user.denied'),
                    });
                }

                this.removeRequest(requestId);
            }),
        ).subscribe();

        this.message$.pipe(
            filter(data => data.type === sendQueryEvent),
            mergeMap((data) => {
                const {
                    data: {
                        query,
                        args,
                    },
                } = data;
                return from((async () => {
                    const { data: response } = await GraphQLService.query({
                        variables: args,
                        query: graphQueryMap[query],
                    });
                    return {
                        ...data,
                        response,
                    };
                })());
            }),
            tap(({
                uiClientId,
                requestId,
                response,
            }) => {
                if (!this.connections[uiClientId]) return;
                this.connections[uiClientId].postMessage({
                    requestId,
                    data: response,
                });
            }),
        ).subscribe();

        this.message$.pipe(
            filter(data => data.type === clientRequestEvent),
            mergeMap(data => from(ApiService.clientApi(data, this))),
            tap((data) => {
                this.ClientResponseSubject.next({
                    ...data,
                    type: clientResponseEvent,
                });
            }),
        ).subscribe();

        this.message$.pipe(
            filter(data => data.type === clientDisconnectEvent),
            tap((data) => {
                this.ClientResponseSubject.next({
                    ...data,
                    type: clientResponseEvent,
                });

                this.closeUi();

                this.ClientResponseSubject.next({
                    ...data,
                    type: uiCloseEvent,
                });

                const {
                    clientId,
                } = data;
                this.removeClient(clientId);
            }),
        ).subscribe();
    }

    registerClient = ({
        port,
        data,
    }) => {
        this.connections[data.clientId] = port;
        this.connections[data.clientId].onmessage = this.onMessage;
    }

    onMessage = ({
        data,
    }) => {
        const {
            clientId,
            requestId,
            sender,
            origin,
            data: clientData,
        } = data;
        if (!this.requests[requestId]) {
            this.requests[requestId] = {};
        }

        if (sender === 'UI_CLIENT') {
            this.requests[requestId].uiClientId = clientId;
        } else if (sender === 'WEB_CLIENT') {
            this.requests[requestId].webClientId = clientId;
        }

        const {
            uiClientId,
            webClientId,
        } = this.requests[requestId];
        this.MessageSubject.next({
            ...data,
            uiClientId,
            webClientId,
            requestId,
            sender,
            data: clientData,
            domain: origin
                ? getDomainFromUrl(origin)
                : '',
        });
    }

    abortUi({
        requestId,
        webClientId,
    }) {
        this.closeUi();
        this.ClientResponseSubject.next({
            type: uiCloseEvent,
            requestId,
            webClientId,
        });

        this.ClientResponseSubject.next({
            type: clientResponseEvent,
            requestId,
            webClientId,
            data: permissionError('user.denied'),
        });

        this.removeRequest(requestId);
    }

    closeUi = () => {
        const event = new CustomEvent('closeAztec');
        window.dispatchEvent(event);
    }

    openUi = (detail) => {
        const event = new CustomEvent('openAztec', {
            detail,
        });
        window.dispatchEvent(event);
    }

    removeRequest(requestId) {
        delete this.requests[requestId];
    }

    removeClient(clientId) {
        delete this.connections[clientId];
        Object.keys(this.requests).forEach((reqId) => {
            const {
                uiClientId,
                webClientId,
            } = this.requests[reqId] || {};
            if (uiClientId === clientId || webClientId === clientId) {
                delete this.requests[reqId];
            }
        });
    }
}

export default new Connection();
