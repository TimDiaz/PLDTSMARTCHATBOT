"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.FMgetFTDetails.FMInternet,
        properties: {
            accountNumber: {
                type: "string",
                required: true
            },
            serviceNumber: {
                type: "string",
                required: true
            }
        },
        supportedActions: ['withInternet', 'withoutInternet', 'failure']
    }),

    invoke: (conversation, done) => {
        // #region Setup Properties  
        const accountNumber = conversation.properties().accountNumber;
        const serviceNumber = conversation.properties().serviceNumber;
        // #endregion

        // #region Imports
        const request = require('request');
        const Logic = require('../../businesslogics/fmGetFTDetails_logic').Logic;
        const globalProp = require('../../helpers/globalProperties');
        const emailSender = require('../../helpers/emailsender');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.FMGetFTDetail.FMInternet);
        const logger = _logger.getLogger();

        logger.sendEmail = ((result, resultCode) => {
            const strResult = JSON.stringify(result);
            const message = globalProp.Email.EmailFormat(globalProp.FMGetFTDetails.API.Name, resultCode, strResult, serviceNumber);
            logger.error(`[ERROR]: ${strResult}`);
            emailSender(globalProp.Email.Subjects.FMgetFTDetails.FMInternet, message, globalProp.Logger.BCPLogging.AppNames.FMgetFTDetails.FMInternet, strResult, resultCode, accountNumber, serviceNumber)
        })

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] FM Get FT Details - FM Internet                                                                   -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition] ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] FM Get FT Details - FM Internet                                                                     -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();

            conversation.transition(transition);
            done();
        });

        let transition = 'failure';
        let optionType = "12"

        logger.addContext("serviceNumber", serviceNumber);

        const logic = new Logic(logger, globalProp);
        // #endregion

        logger.start();

        const requestBody = JSON.stringify({
            "optionType": optionType,
            "serviceId": accountNumber
        });
        logger.debug(`Setting up the request body: ${requestBody}`);

        const options = globalProp.FMGetFTDetails.API.PostOptions(requestBody);
        logger.debug(`Setting up the post option: ${JSON.stringify(options)}`);

        logger.info(`Starting to invoke the request.`)
        request(options, function (error, response) {
            if (error) {
                logger.sendEmail(error, error.code)
                transition = 'failure';
            }
            else {
                if (response.statusCode > 200) {
                    logger.sendEmail(error, error.code)
                    transition = 'failure';
                }
                else {
                    var respBody = response.body;
                    var JSONRes = JSON.parse(respBody);

                    logger.debug(`[Response Body] ${respBody}`);
                    if(JSONRes.result.SERVICE_TYPE === undefined)
                    {
                        transition = 'failure';
                    }
                    else{
                        logger.debug(`[Service Type] ${JSONRes.result.SERVICE_TYPE}`)
                        logger.debug(`[Account Number] ${accountNumber}`)

                        const result = logic.FMInternet(JSONRes.result.SERVICE_TYPE);
                        transition = result.Transition;

                        result.Variables.forEach(element => {
                            conversation.variable(element.name, element.value);
                            logger.info(`[Variable] Name: ${element.name} - Value ${element.value}`);
                        });
                    }
                }
            }
            logger.end()
        });
    }
};