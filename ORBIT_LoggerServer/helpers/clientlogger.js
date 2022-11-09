const log4js = require('log4js');
const wssClient = require('./@log4js-node/wss-client')
module.exports = {
    logger: (category) => {     
        const cat = category || "default";

        log4js.configure({
            appenders: {
                console: { type: 'console' },
                network: { type: wssClient },
            },
            categories: {
                default: { appenders: ['network', 'console'], level: 'all' },
            }
        });
        return {getLogger: () => { return log4js.getLogger(cat)}, shutdown: () => {return log4js.shutdown()}};
    }
}