const request = require('request');
const globalProp = require('../helpers/globalProperties');

let logger;

const apiRequest = (areacode, telephone, callback) =>{
    const requestBody = JSON.stringify({
        "AREACODE": areacode,
        "TELEPHONE": telephone,
        "CONSUMER": globalProp.NumberServiceability.API.Serviceable.Consumer,
        "TOKEN": globalProp.NumberServiceability.API.Serviceable.Token
    });
    logger.debug(`Setting up the request body: ${requestBody}`);

    var options = globalProp.NumberServiceability.API.Serviceable.PostOptions(requestBody);
    logger.debug(`Setting up the post option: ${JSON.stringify(options)}`);

    logger.info(`Starting to invoke the request.`)
    request(options, function (error, response) {
        logger.info(`Invoking request successful.`)
        callback(error, response)
    });
}

module.exports = {
    LoggerInstance: (instance) => { logger = instance},
    PostRequest: apiRequest
}