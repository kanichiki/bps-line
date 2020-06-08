const log4js = require('log4js')

log4js.configure({
    appenders: {
        system: { type: 'file', filename: '../logs/system.log', pattern: '.yyyyMMdd' },
        debug: { type: 'file', filename: '../logs/debug.log', pattern: '.yyyyMMdd' }
    },
    categories: {
        default: { appenders: ['system'], level: 'info' },
        debug: { appenders: ['debug'], level: 'debug' }
    }
});
const systemLogger = log4js.getLogger('system');
const debugLogger = log4js.getLogger('debug');

module.exports = {
    systemLogger: systemLogger,
    debugLogger: debugLogger
}