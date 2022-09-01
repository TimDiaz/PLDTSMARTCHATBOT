"use strict";

//******************************************************************************************************************************//
// [START] DEVELOPMENT CONFIGURATION                                                                                            //
// NOTE: Uncomment this for development deployment                                                                              //
//******************************************************************************************************************************//
const hostName = 'staging.chatbot171.pldthome.com';
const wssLogger = {
    Protocol: 'wss',
    URL: hostName,
    Port: 5000
};

const bcpLogging = {
    URL: `https://${hostName}:7745/bcplogginginsert`,
    AppNames: {
        AccountValidation: "orbit_dev-accountvalidation",
        NumberServiceability:{
            Param: "orbit_dev-numberserviceability-Param",
            Region: "orbit_dev-numberserviceability-Region",
            Technology: "orbit_dev-numberserviceability-Techonology"
        }
    },
}
//******************************************************************************************************************************//
// [END] DEVELOPMENT CONFIGURATION                                                                                              //
//******************************************************************************************************************************//

//******************************************************************************************************************************//
// [START] PRODUCTION CONFIGURATION                                                                                             //
// NOTE: Uncomment this for production deployment                                                                               //
//******************************************************************************************************************************//
// const hostName = 'chatbot171.pldthome.com';
// const wssLogger = {
//     Protocol: 'wss',
//     URL: hostName,
//     Port: 5000
// };

// const bcpLogging = {
//     URL: 'https://${hostName}:7745/bcplogginginsert',
//     AppNames: {
//         AccountValidation: "orbit_prod-accountvalidation",
//         NumberServiceability:{
//             Param: "orbit_prod-numberserviceability-Param",
//             Region: "orbit_prod-numberserviceability-Region",
//             Technology: "orbit_prod-numberserviceability-Techonology"
//         }
//     },
// }
//******************************************************************************************************************************//
// [END] PRODUCTION CONFIGURATION                                                                                               //
//******************************************************************************************************************************//

module.exports = {     
    WSSLogger: wssLogger,
    BCPLogging: bcpLogging,
    Layout: {
        type: "pattern",
        pattern: "[%x{dateTime}] [%p] [%c] %m",
        tokens: {
            dateTime: function(logEvent) {
                return moment.tz(Date.now(), 'Asia/Manila').format('MM-DD-YYYY hh:mm:ss.SSS A');
            },
        }
    },
    Category: {
        Default: 'default',
        Mailer: 'mailer',
        AccountValidation: 'AccountValidation',
        ValidateAccountNumberFormat: 'ValidateAccountNumberFormat',
        ValidateServiceNumberFormat: 'ValidateServiceNumberFormat',
        NumberServiceabilityParam: 'NumberServiceabilityParam'
    }
}