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
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        const _logger = instance.logger(globalProp.Logger.Category.AccountEligibility);
        const logger = _logger.getLogger();
        const _emailLog = instance.logger(globalProp.Logger.Category.Mailer);        
        const emailLog = _emailLog.getLogger();

        function logError(result, resultCode){
            const strResult = JSON.stringify(result);
            emailLog.addContext("apierrorcode", strResult);
            emailLog.addContext("apierrormsg", resultCode);
            const message = globalProp.Email.EmailFormat(globalProp.AccountEligibility.API.Name, resultCode, strResult, serviceNumber);

            logger.error(`[ERROR CODE: ${resultCode}] ${strResult}`)
            emailLog.error(message);
        }

        let transition = 'failure';

		var serviceNumber = conversation.properties().serviceNumber;
	    logger.addContext("serviceNumber", serviceNumber);
        emailLog.addContext("subject", globalProp.Email.Subjects.AccountEligibility);
        emailLog.addContext("apiUrl", globalProp.Logger.BCPLogging.URL);
        emailLog.addContext("apiname", globalProp.Logger.BCPLogging.AppNames.AccountEligibility.TSEligibility);
        emailLog.addContext("usertelephonenumber", serviceNumber);
        emailLog.addContext("useraccountnumber", '');

        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        logger.info(`- [START] Account Eligibility                                                                               -`)
        logger.info(`-------------------------------------------------------------------------------------------------------------`)

        const options = globalProp.AccountEligibility.API.GetOptions(serviceNumber);
        logger.debug(`Setting up the get option: ${JSON.stringify(options)}`);

        logger.info(`Starting to invoke the request.`)  
        request(options, function (error, response) {
            if (error) {
                logError(error, error.code);
                transition = 'failure';  
            }
            else{
                var respBody = response.body;
                var JSONRes = JSON.parse(respBody);
                const types = globalProp.AccountEligibility.Types;
            
                logger.info(`[Response Body] ${respBody}`);
                if(response.statusCode > 200)
                {
                    logError(response.body, response.statusCode);
                    transition = 'failure'; 

                    switch(response.statusCode){
                        case 500:
                            logger.error(`[ERROR CODE: ${response.statusCode}] Internal Server Error Ecountered, Please try a different account.`);
                            break;
                        case 408:
                            logger.error(`[ERROR CODE: ${response.statusCode}] Request Time out, Please try again later.`);
                            break;
                        case 502:
                            logger.error(`[ERROR CODE: ${response.statusCode}] Bad Gateway Error, Please try again later.`);
                            break;
                        case 599:
                            logger.error(`[ERROR CODE: ${response.statusCode}] Network Connect Timeout Error, Please try again later.`);
                            break;
                        default:
                            logger.error(`[ERROR CODE: ${response.statusCode}] OOPS, Error Happened! Contact Administrator..`);
                            break;
                    }
                }
                else{
                    if (JSONRes.eligible === false) {
                        const message = JSONRes.message.toString();
                        const spiel =  JSONRes.spiel? JSONRes.spiel.toString() : '';

                        switch(message){
                            case types.UnderTreatment.Message:
                                logger.debug(`[Response Message]: ${types.UnderTreatment.Message}`);
                                logger.debug(`[Spiel]: ${spiel}`);

                                conversation.variable(types.UnderTreatment.Conversation.Variables[0], spiel);
                                transition = types.UnderTreatment.Conversation.Transition;
                                break;
                            case types.AccountIsNotRBG.Message:
                                logger.debug(`[Response Message]: ${types.AccountIsNotRBG.Message}`);
                                logger.debug(`[Spiel]: ${spiel}`);

                                conversation.variable(types.AccountIsNotRBG.Conversation.Variables[0], spiel);
                                transition = types.AccountIsNotRBG.Conversation.Transition;
                                break;
                            case types.WithOpenRepairTicket.Message:
                                logger.debug(`[Response Message]: ${types.WithOpenRepairTicket.Message}`);
                                logger.debug(`[Spiel]: ${spiel}`);
                                
                                var tickmatch = spiel.match(globalProp.AccountEligibility.Validation.DigitsOnly);
                                var ticketNum = tickmatch[0];
                                var ticketTier = spiel.match(globalProp.AccountEligibility.Validation.Tier);
                                var ticketType = spiel.match(globalProp.AccountEligibility.Validation.Types);
                                var promWorgSpiel = "";

                                logger.debug(`value of ticket tier:  [${ticketTier}].`);
                                logger.debug(`value of ticket type:  [${ticketType}].`);
                                logger.debug(`value of ticket number:  [${ticketNum}].`);
                                
                                conversation.variable(types.WithOpenRepairTicket.Tier.Conversation.Variables[0], ticketNum);
                                const tier = types.WithOpenRepairTicket.Tier;
                                switch(ticketTier){
                                    case tier.Parent.Name:
                                        const parent = tier.Parent.TicketTypes;                                        
                                        conversation.variable(parent.Conversation.Variables[0], ticketType.toString());
                                        if (ticketType == parent.VC.Name){                                    
                                            transition = parent.VC.Conversation.Transition;
                                        }else if (ticketType.includes(parent.CR.Name)) {
                                            transition = parent.CR.Conversation.Transition;
                                        }else{
                                            transition = parent.Default.Conversation.Transition;
                                        }
                                        break;
                                    case tier.Child.Name:
                                        transition = tier.Child.TicketTypes.Conversation.Transition;
                                        break;
                                    default:
                                        const def = tier.Default;
                                        if (spiel.match(def.Types.InitialDiagnosis.Validation)){
                                            conversation.variable(def.Conversation.Variables[0], def.Types.InitialDiagnosis.PromWordSpiel.replace('${ticketNumber}', ticketNum));    
                                        }else if (spiel.match(def.Types.Testing.Validation)) {
                                            conversation.variable(def.Conversation.Variables[0], def.Types.Testing.PromWordSpiel);    
                                        }else if (spiel.match(def.Types.Dispatched.Validation)) {
                                            conversation.variable(def.Conversation.Variables[0], def.Types.Dispatched.PromWordSpiel.replace('${ticketNumber}', ticketNum));    
                                        }else if (spiel.match(def.Types.FurtherTesting.Validation)) {
                                            conversation.variable(def.Conversation.Variables[0], def.Types.FurtherTesting.PromWordSpiel);    
                                        }else if (spiel.match(def.Types.Resolved.Validation)) {
                                            conversation.variable(def.Conversation.Variables[0], def.Types.Resolved.PromWordSpiel);    
                                        } else {
                                            conversation.variable(def.Conversation.Variables[0], def.Types.Deafult.PromWordSpiel.replace('${ticketNumber}', ticketNum));    
                                        }
                                        transition = def.Conversation.Transition;
                                        break;

                                }
                                break;
                            case types.WithOpenSO.Message:
                                logger.debug(`[Response Message]: ${types.WithOpenSO.Message}`);
                                logger.debug(`[Spiel]: ${spiel}`);
                                
                                if (spiel.match(globalProp.AccountEligibility.Validation.DigitsOnly)) {
                                    var soMatches = spiel.split(globalProp.AccountEligibility.Validation.NumberRange);
                                    var soNum = soMatches[1];
                                    conversation.variable(types.WithOpenSO.Conversation.Variables[1], soNum);
                                }
                                else
                                    conversation.variable(types.WithOpenSO.Conversation.Variables[1], "undefined");

                                conversation.variable(types.WithOpenSO.Conversation.Variables[0], spiel);
                                transition = types.WithOpenSO.Conversation.Transition;
                                break;
                            case types.WithOpenTransferSO.Message:
                                logger.debug(`[Response Message]: ${types.WithOpenTransferSO.Message}`);
                                logger.debug(`[Spiel]: ${spiel}`);

                                var matches = spiel.match(globalProp.AccountEligibility.Validation.DigitsOnly);
                                conversation.variable(types.WithOpenTransferSO.Conversation.Variables[1], matches);
                                conversation.variable(types.WithOpenTransferSO.Conversation.Variables[0], spiel);
                                transition = types.WithOpenTransferSO.Conversation.Transition;
                                break;
                            case types.InvalidServiceNumber.Message:
                                logger.debug(`[Message]: Invalid Service Number`);
                                transition = types.InvalidServiceNumber.Conversation.Transition;
                                break;
                            default:
                                logger.debug(`[Spiel]: ${spiel}`);

                                var matches = spiel.match(globalProp.AccountEligibility.Validation.DigitsOnly);
                                conversation.variable(types.OpenOrder.Conversation.Variables[1], matches);
                                conversation.variable(types.OpenOrder.Conversation.Variables[0], spiel);
                                transition = types.OpenOrder.Conversation.Transition;
                                break;
                        }
                    }
                    else {
                        transition = 'eligible';
                        conversation.keepTurn(true);
                    }
                }
            }
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Account Eligibility                                                                                 -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();
            _emailLog.shutdown();

            conversation.transition(transition);
            // done();
        });
    }
};