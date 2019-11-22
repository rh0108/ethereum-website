const path = require('path');

module.exports = {
    testRegex: '/__tests__/.*\\.(test|spec)\\.js$',
    setupFiles: [
        './tests/setupGlobals.js',
    ],
    moduleNameMapper: {
        '^~testHelpers/(.*)$': path.resolve(__dirname, 'tests/helpers/$1'),
    },
};