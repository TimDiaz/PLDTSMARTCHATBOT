const log4js = require('log4js');
var moment = require('moment-timezone');
var log4jsmtp = require('./@log4js-node/smtp');

module.exports = {
    configure: () => {
        return log4js.configure({
            appenders: {
                multi: {
                    type: "multiFile",
                    base: "/home/opc/orbit_logger_server/logs/", //home/opc/orbit_logger_server/logs/
                    property: "serviceNumber",
                    extension: ".log",
                    maxLogSize: 10485760,
                    backups: 5,
                    compress: true,
                    layout: {
                        type: "pattern",
                        pattern: "[%x{dateTime}] [%p] [%c] %m",
                        tokens: {
                            dateTime: function (logEvent) {
                                return moment.tz(Date.now(), 'Asia/Manila').format('MM-DD-YYYY hh:mm:ss.SSS A');
                            },
                        }
                    },
                },
                mail: {
                    type: log4jsmtp,
                    recipients: 't-tsdiaz@supplier.smart.com.ph, t-jpvalete@supplier.smart.com.ph',
                    transport: 'SMTP',
                    SMTP: {
                        host: 'smtp.gmail.com',
                        port: 587,
                        auth: {
                            user: 'ndphchatbot@gmail.com',
                            pass: 'nwqiqdpeezxtdatx',
                        },
                        debug: true,
                    },
                    layout: {
                        type: "pattern",
                        pattern: "[%x{dateTime}] [%p] %m",
                        tokens: {
                            dateTime: function(logEvent) {
                                return moment.tz(Date.now(), 'Asia/Manila').format('MM-DD-YYYY hh:mm:ss.SSS A');
                            },
                        }
                    }
                },
                console: { type: 'console' },
                server: { type: 'wss-server', port: 5000 },
            },
            categories: {
                default: { appenders: ['multi', 'console'], level: 'all' },
                mailer: { appenders: ['mail'], level: 'error' }
            },
            pm2: false
        });
    }
}