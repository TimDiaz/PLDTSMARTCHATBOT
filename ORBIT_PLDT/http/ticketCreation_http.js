const fetch = require('node-fetch');
const request = require('request');
const globalProp = require('../helpers/globalProperties');

let logger;

const apiRequest = (requestBody, retry, callback) =>{
    logger.debug(`[RETRY ${retry}] Setting up the request body: ${requestBody}`);

    const options = globalProp.TicketCreation.API.Validate.PostOptions(requestBody);
    logger.debug(`[RETRY ${retry}] Setting up the get option: ${JSON.stringify(options)}`);

    logger.info(`[RETRY ${retry}] Starting to invoke the request.`)
    request(options, function (error, response) {
        logger.info(`[RETRY ${retry}] Invoking request successful.`)
        callback(error, response)
    });
}

const apiChatbotUpdateRequest = (accNumberinit, telNumberinit, smpStartTsinit, ticketnumber, reportedBy, responseBody, callback) =>{
    logger.info(`[UPDATE CREATE FT REQUEST] ------------------------------------------------------------------------------------`);
    var options = globalProp.TicketCreation.API.UpdateCreateFt.PostOptions({
        "AccountNumber": accNumberinit,
        "TelephoneNumber": telNumberinit,
        "smpTS": smpStartTsinit,
        "TicketNumberCreateFT": ticketnumber,
        "ReportedBY": reportedBy,
        "ResponseBody": responseBody
    });
    logger.info(`[UPDATE CREATE FT REQUEST OPTION] ${JSON.stringify(options)}`);
    fetch(globalProp.TicketCreation.API.UpdateCreateFt.URL, options).then((response) => {
        if (response.status > 200) {
            logger.error(`[UPDATE CREATE FT ERROR] ${response.statusText}`);
        } else {
            logger.info(`[UPDATE CREATE FT RESPONSE] ${JSON.stringify(response)}`);
        }
    }).catch((error) => {
        logger.error(`[UPDATE CREATE FT ERROR] ${error}`);
    });
}

module.exports = {
    LoggerInstance: (instance) => { logger = instance},
    PostRequest: apiRequest,
    ChatbotUpdateRequest: apiChatbotUpdateRequest
}