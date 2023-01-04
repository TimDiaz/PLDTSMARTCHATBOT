const request = require('request');
const globalProp = require('../helpers/globalProperties');

let logger;

const CheckWaitTimeRequest = (deploymentid, buttonid, callback) =>{
    var options = globalProp.CheckWaitTime.API.WaitTime.PostOptions(deploymentid, buttonid);
    logger.debug(`Setting up the get option: ${JSON.stringify(options)}`);

    logger.info(`Starting to invoke the request.`)        
    request(options, (error, response) => {
        logger.info(`Invoking request successful.`)
        callback(error, response)        
    });
}

const ChatAdCaseCreateTokenRequest = (callback) =>{
    var options = globalProp.ChatAdCaseCreate.API.ChatAdToken.PostOptions();
    logger.debug(`Setting up the token post option: ${JSON.stringify(options)}`);

    logger.info(`Starting to invoke the token request.`)        
    request(options, (error, response) => {
        logger.info(`Invoking request token successful.`)
        callback(error, response)        
    });
}

const ChatAdCaseCreateRequest = (authBearer, requestBody, callback) =>{
    var options = globalProp.ChatAdCaseCreate.API.ChatAdCaseCreate.PostOptions(authBearer, requestBody);
    logger.debug(`Setting up the post option: ${JSON.stringify(options)}`);

    logger.info(`Starting to invoke the request.`)        
    request(options, (error, response) => {
        logger.info(`Invoking request successful.`)
        callback(error, response)        
    });
}

module.exports = {
    LoggerInstance: (instance) => { logger = instance},
    CheckWaitTimeRequest: CheckWaitTimeRequest,
    ChatAdCaseCreateTokenRequest: ChatAdCaseCreateTokenRequest,
    ChatAdCaseCreateRequest: ChatAdCaseCreateRequest
}