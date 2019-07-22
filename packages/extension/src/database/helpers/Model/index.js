import {
    errorLog,
} from '~utils/log';
import transformDataForDb from '~database/utils/transformDataForDb';
import get from './get';
import set from './set';
import update from './update';

const configType = {
    name: {
        type: 'string',
        isRequired: true,
    },
    fields: {
        type: (val) => {
            if (Array.isArray(val)) {
                return true;
            }

            if (val) {
                if (!('key' in val)) {
                    errorLog("'key' is not defined in 'fields' object");
                    return false;
                }
                if (!('fields' in val)) {
                    errorLog("'fields' is not defined in 'fields' object");
                    return false;
                }
            }

            return true;
        },
        isRequired: true,
    },
    index: {
        type: 'string',
        defaultValue: 'id',
    },
    autoIncrementBy: {
        type: 'string',
    },
    dataKeyPattern: {
        type: 'string',
    },
};

const validateConfig = (config) => {
    const validated = {};
    const isValid = Object.keys(configType)
        .every((field) => {
            const {
                isRequired,
                type,
                defaultValue,
            } = configType[field];
            const val = config[field];

            const errors = [];
            if (isRequired && val === undefined) {
                errors.push(`Field '${field}' must be provided in Model's config.`);
            } else if (type && val !== undefined) {
                let isWrongType;
                if (typeof type === 'function') {
                    isWrongType = !type(val);
                } else {
                    isWrongType = type === 'array'
                        ? !Array.isArray(val)
                        : typeof val !== type; // eslint-disable-line valid-typeof
                }
                if (isWrongType) {
                    errors.push(`Field '${field}' should be ${type}. Received ${typeof val}.`);
                }
            }
            if (errors.length) {
                if (config.name) {
                    errors.push(`at '${config.name}' model's constructor`);
                }
                errorLog(...errors);
                return false;
            }

            validated[field] = val !== undefined
                ? val
                : defaultValue;

            return true;
        });

    return isValid
        ? validated
        : null;
};

export default function Model(config) {
    const validatedConfig = validateConfig(config);
    if (!validatedConfig) {
        return null;
    }
    const {
        fields,
    } = validatedConfig;

    const settings = {
        config: validatedConfig,
    };

    return {
        get: get.bind(settings),
        set: set.bind(settings),
        update: update.bind(settings),
        toStorageData: data => transformDataForDb(fields, data),
    };
}
