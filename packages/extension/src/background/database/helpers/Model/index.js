import {
    registerModel,
} from '../..';
import {
    errorLog,
} from '~/utils/log';

// add
import add from './add';
import bulkAdd from './bulkAdd';

// update
import put from './put';
import update from './update';
import bulkPut from './bulkPut';

// retrieve
import get from './get';
import bulkGet from './bulkGet';
import query from './query';
import latest from './latest';


/* Format of config file
* {
*   name: "Account"
*   version: 1,
*   pk: 'id', // Primary Key
*   fields: [
*       '++id',
*       'firstName',
*       'lastName',
*   ],
*   autoFields: {
*       firstNameLastName: {
*           childFields: ['firstName', 'lastName'],
*       }
*   }, // autogenerated fields to speed up filtering queries
* }
*/
export default function Model(config) {
    const {
        name,
        version,
        fields,
        autoFields: autoFieldsConfig = {},
        pk: primaryKey = config.fields[0],
    } = config;

    if (!name) {
        errorLog('Cannot define new indexDb model, as "name" is not defined');
        return null;
    }

    if (!version) {
        errorLog(`Cannot define new indexDb "${name}" model, as "version" is not uefined`);
        return null;
    }

    if (!fields || !Array.isArray(fields) || fields.length < 1) {
        errorLog(`Cannot define new indexDb "${name}" model, as "fields" value is not array or it is empty`);
        return null;
    }

    const dexieConfig = {};
    const autoFields = Object.keys(autoFieldsConfig);
    const modelConfig = {
        ...config,
        hasAutoFields: autoFields.length > 0,
    };
    const allFields = [
        ...fields,
        ...autoFields,
    ];
    if (!allFields.includes(primaryKey)) {
        errorLog(`Not right primary key, there is no such field: "${primaryKey}" in the model "${name}"`);
        return null;
    }

    /**
     * Pk must be always on the first place
     */
    dexieConfig[name] = [
        primaryKey,
        ...allFields.filter(field => field !== primaryKey),
    ].join(',');

    registerModel(db => db.version(version).stores(dexieConfig));

    return {
        // mutations
        add: (item, options) => add(name, item, { options, modelConfig }),
        bulkAdd: (items, options) => bulkAdd(name, items, { options, modelConfig }),
        put: (items, options) => put(name, items, { options, modelConfig }),
        bulkPut: (items, options) => bulkPut(name, items, { options, modelConfig }),
        update: (items, options) => update(name, items, { options, modelConfig }),

        // queries
        get: (options, pk) => get(name, options, pk),
        bulkGet: (options, keys) => bulkGet(name, options, keys),
        query: options => query(name, options),
        latest: (options,
            {
                orderBy = 'blockNumber',
                filterOptions = {},
            } = {
                orderBy: 'blockNumber',
                filterOptions: {},
            }) => latest(name, options, { orderBy, filterOptions }),
    };
}
