const server_log4js = require('log4js');
var moment = require('moment-timezone');
var log4js_oci_notif = require('./@log4js-node/oci-notification/lib');

module.exports = {
    configure: () => {
        return server_log4js.configure({
            appenders: {
                multi: {
                    type: "multiFile",
                    base: "/home/opc/orbit_logger_cares_server/logs/", //home/opc/orbit_logger_server/logs/
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
                    type: log4js_oci_notif,
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
                server: { type: 'wss-server', port: 5001 },
            },
            categories: {
                default: { appenders: ['multi', 'console'], level: 'all' },
                mailer: { appenders: ['mail'], level: 'error' }
            },
            pm2: false
        });
    }
}