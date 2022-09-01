const moment = require('moment-timezone');
const loggerConfig = require('./logger_config');

module.exports = {
    Subjects: {
        AccountValidation: '[API Error] Account Validation PROD - Subscriber Checking',
        NumberServiceabilityParam: '[API Error] NumberServiceability PROD - VIP checking'
    },
    EmailFormat: (code, message, serviceNumber) => {
        const dateTimeNow = moment.tz(Date.now(), 'Asia/Manila').format('MM-DD-YYYY hh:mm A');
        return `Status Code: ${code} 
                Telephone Number: ${serviceNumber} 
                API: AccountValidation 
                Datetime: ${dateTimeNow} 
                Error: ${message}`;
    },
}