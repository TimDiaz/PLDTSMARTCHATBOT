const request = require('request');
const globalProp = require('../helpers/globalProperties');

let logger;

const apiLogResponseRequest = (responseType, telephoneNumber, accountNumber, responseBody, isOn = true) => {
    if (isOn) {
        var body = JSON.stringify({
            "responseType": responseType,
            "telephoneNumber": telephoneNumber,
            "accountNumber": accountNumber,
            "responseBody": responseBody
        });

        const options = globalProp.Reconnection.API.InsertDataOptions(body);
        request(options, function (error, response) {
            if (error) {
                logger.error(`[SUCCESSFUL] ${error}`);
            } else {
                logger.info(`[SUCCESSFUL] ${response.body}`);
            }
        });
    }
}

const apiRequest = (requestBody, callback) => {
    const options = globalProp.Reconnection.API.PostOptions(requestBody);
    logger.debug(`Setting up the get option: ${JSON.stringify(options)}`);

    logger.info(`Starting to invoke the request.`)
    request(options, function (error, response) {
        logger.info(`Invoking request successful.`)
        callback(error, response)
    });
}

module.exports = {
    LoggerInstance: (instance) => { logger = instance },
    PostRequest: apiRequest,
    LogResponse: apiLogResponseRequest
}