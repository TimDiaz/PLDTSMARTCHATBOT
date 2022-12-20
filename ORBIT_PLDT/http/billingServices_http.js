const request = require('request');
const globalProp = require('../helpers/globalProperties');

let logger;

const autoBalRequest = (serviceNumber, callback) => {
    var options = globalProp.BillingServices.Autobal.API.CheckBalance.GetOptions(serviceNumber);
    logger.debug(`Setting up the get option for API Token: ${JSON.stringify(options)}`);
    logger.info(`Starting to invoke the request for API Token.`);
    request(options, function (error, response) {
        logger.info(`Invoking request successful.`)
        callback(error, response)
    });
}

const autoESoaRequest = (serviceNumber, month, callback) => {
    let numMon;
    if (month == 'Current Month')
        numMon = 1;
    else if (month == 'Last 3 Months')
        numMon = 3;

    var options = globalProp.BillingServices.Autoesoa.API.GetEsoaBalance.GetOptions(serviceNumber, numMon);
    logger.debug(`Setting up the get option for API Token: ${JSON.stringify(options)}`);
    logger.info(`Starting to invoke the request for API Token.`);
    request(options, function (error, response) {
        logger.info(`Invoking request successful.`)
        callback(error, response)
    });
}

module.exports = {
    LoggerInstance: (instance) => { logger = instance },
    AutoBalRequest: autoBalRequest,
    AutoESoaRequest: autoESoaRequest
}