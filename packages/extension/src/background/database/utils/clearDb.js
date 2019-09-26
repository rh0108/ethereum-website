import { 
    getDB,
    storedNetworks,
} from '../'
import {
    errorLog,
} from '~utils/log';

const performClearDB = (networkId) => {
    getDB(networkId).tables.forEach(function (table) {
        table.clear();
    });
};

export default function clearDB({
    networkId,
    clearAllNetworks = true,
} = {
    networkId: null,
    clearAllNetworks: true,
}) {
    if (networkId || networkId === 0) {
        performClearDB(networkId);

    } else if (clearAllNetworks) {
        storedNetworks().forEach(networkId => {
            performClearDB(networkId);
        });

    } else {
        errorLog('Cannot clear DB. Should be specified "networkId" or "clearAllNetworks"');
    }
};