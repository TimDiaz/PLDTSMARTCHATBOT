const request = require('request');
const globalProp = require('../helpers/globalProperties');

let logger;

const apiRequest = (accountNumber, serviceNumber, callback) =>{
    const requestBody = JSON.stringify({
        "accountNumber": accountNumber,
        "serviceNumber": serviceNumber
    });
    logger.debug(`Setting up the request body: ${requestBody}`);

    const options = globalProp.AccountValidation.API.Validate.PostOptions(requestBody);
    logger.debug(`Setting up the post option: ${JSON.stringify(options)}`);

    logger.info(`Starting to invoke the request.`)        
    request(options, (error, response) => {
        logger.info(`Invoking request successful.`)
        callback(error, response)        
    });
}

module.exports = {
    LoggerInstance: (instance) => { logger = instance},
    PostRequest: apiRequest
}