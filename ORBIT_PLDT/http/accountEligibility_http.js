const request = require('request');
const globalProp = require('../helpers/globalProperties');

let logger;

const apiRequest = ( serviceNumber, callback) =>{
    const options = globalProp.AccountEligibility.API.GetOptions(serviceNumber);
    logger.debug(`Setting up the get option: ${JSON.stringify(options)}`);

    logger.info(`Starting to invoke the request.`)
    request(options, function (error, response) {
        logger.info(`Invoking request successful.`)
        callback(error, response)
    });
}

module.exports = {
    LoggerInstance: (instance) => { logger = instance},
    GetRequest: apiRequest
}