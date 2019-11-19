const sequelize = require('./helpers/connection');
const {
    log,
    errorLog,
} = require('../../utils/log');

module.exports = async () => {
    try {
        await sequelize.close()
        log('Connection has been closed successfully.');
        return true;
    } catch (e) {
        errorLog('Unable to close connection:', e);
        return false;
    };
};
