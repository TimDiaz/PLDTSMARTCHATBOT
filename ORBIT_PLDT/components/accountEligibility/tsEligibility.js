"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
            name: componentName.TSEligibility,
            properties: {
				serviceNumber: {
                    type: "string",
                    required: true
                }
            },
            supportedActions: ['undertreatment', 'withOpenParent', 'withOpenParentVC', 'withOpenParentCR', 'withOpenChildTicket', 'withOpenIndTicket', 'openorder', 'eligible', 'openSo', 'notRBG', 'failure', 'invalidServiceNum']
    }),

    invoke: (conversation, done) => {
        // #region Setup Properties
        var serviceNumber = conversation.properties().serviceNumber;
        // #endregion

        // #region Imports
        const request = require('request');
        const Logic = require('../../businesslogics/eligibility_logic').Logic;
        const globalProp = require('../../helpers/globalProperties');
        const emailSender = require('../../helpers/emailsender');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.AccountEligibility);
        const logger = _logger.getLogger();
        
        logger.sendEmail = ((result, resultCode) => {
            const strResult = JSON.stringify(result);
            const message = globalProp.Email.EmailFormat(globalProp.AccountEligibility.API.Name, resultCode, strResult, svcNumber);
            logger.error(`[ERROR]: ${strResult}`);              
            emailSender(globalProp.Email.Subjects.AccountEligibility, message, globalProp.Logger.BCPLogging.AppNames.AccountEligibility, strResult, resultCode, 'NO DATA', serviceNumber)
        }) 

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] Account Eligibility                                                                               -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Account Eligibility                                                                                 -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();

            conversation.transition(transition);
            done();
        });

        let transition = 'failure';
		
	    logger.addContext("serviceNumber", serviceNumber);

        const logic = new Logic(logger, globalProp);
        // #endregion

        logger.start();

        const options = globalProp.AccountEligibility.API.GetOptions(serviceNumber);
        logger.debug(`Setting up the get option: ${JSON.stringify(options)}`);

        logger.info(`Starting to invoke the request.`)  
        request(options, function (error, response) {
            if (error) {
                logger.sendEmail(error, error.code)
                transition = 'failure';  
            }
            else{
                var respBody = response.body;
                var JSONRes = JSON.parse(respBody);
                const types = globalProp.AccountEligibility.Types;
            
                logger.info(`[Response Body] ${respBody}`);
                if(response.statusCode > 200)
                {
                    logger.sendEmail(response.body, response.statusCode)
                    transition = 'failure';  
                    logger.error(logic.ErrorResponse(response.statusCode).Message);
                }
                else{
                    if (JSONRes.eligible === false) {
                        const message = JSONRes.message.toString();
                        const spiel =  JSONRes.spiel? JSONRes.spiel.toString() : '';

                        const result = logic.Process(message, spiel);
                        transition = result.Transition;

                        result.Variables.forEach(element => {
                            conversation.variable(element.name, element.value);
                        });
                    }
                    else {
                        transition = 'eligible';
                        conversation.keepTurn(true);
                    }
                }
            }
            logger.end();
        });
    }
};