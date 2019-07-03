import dataKeyConfig from '../config/dataKey';

export default function dataKey(type, data, config = dataKeyConfig) {
    const pattern = typeof type === 'string' && type.match(/{([^{}]+)}/)
        ? type
        : config[type];

    if (!pattern) {
        return '';
    }

    return pattern.replace(/{([^{}]+)}/ig, (_, key) => {
        if (!(key in data)) {
            console.error(`${key} not found in type ${type}`);
            return _;
        }
        return data[key];
    });
}
