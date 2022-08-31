module.exports = { 
    Category: {
        Default: 'default',
        Mailer: 'mailer',
        AccountValidation: 'AccountValidation',
        ValidateAccountNumberFormat: 'ValidateAccountNumberFormat',
        ValidateServiceNumberFormat: 'ValidateServiceNumberFormat',
        NumberServiceabilityParam: 'NumberServiceabilityParam'
    },
    WSSLogger: {
        Protocol: 'wss',
        URL: 'staging.chatbot171.pldthome.com',
        Port: 5000
    },
    BCPLogging: {
        URL: 'https://staging.chatbot171.pldthome.com:7745/bcplogginginsert',
        AppNames: {
            AccountValidation: "orbit_prod-accountvalidation",
            NumberServiceability:{
                Param: "orbit_prod-numberserviceability-Param",
                Region: "orbit_prod-numberserviceability-Region",
                Technology: "orbit_prod-numberserviceability-Techonology"
            }
        },
    },
    Layout: {
        type: "pattern",
        pattern: "[%x{dateTime}] [%p] [%c] %m",
        tokens: {
            dateTime: function(logEvent) {
                return moment.tz(Date.now(), 'Asia/Manila').format('MM-DD-YYYY hh:mm:ss.SSS A');
            },
        }
    }
}