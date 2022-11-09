const log4js = require('log4js');
// const log4jsmtp = require('./@log4js-node/smtp');
const wssClient = require('./@log4js-node/wss-client');
const globalProp = require('./globalProperties');

module.exports = {
    logger: (appName) => {     
        const appname = appName || "Server";

        log4js.configure({
            appenders: {
                console: { type: 'console' },
                network: { type: wssClient, host: globalProp.Logger.WSSLogger.URL, port: globalProp.Logger.WSSLogger.Port, protocol: globalProp.Logger.WSSLogger.Protocol },
            },
            categories: {
                default: { appenders: ['network', 'console'], level: 'all' }
            }
        });
        return {
            getLogger: () => { return log4js.getLogger(appname)}, 
            shutdown: () => {return log4js.shutdown()}
        };
    }
}