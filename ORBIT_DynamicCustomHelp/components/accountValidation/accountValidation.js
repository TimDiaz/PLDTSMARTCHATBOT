"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.AccountValidation,
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
        supportedActions: ['validAcct', 'invalidAcct', 'failure', '504State']
    }),
    invoke: (conversation, done) => {        
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        const _logger = instance.logger(globalProp.Logger.Category.AccountValidation);
        const logger = _logger.getLogger();
        const _emailLog = instance.logger(globalProp.Logger.Category.Mailer);        
        const emailLog = _emailLog.getLogger();

        function logError(result, resultCode){
            const strResult = JSON.stringify(result);
            emailLog.addContext("apierrorcode", strResult);
            emailLog.addContext("apierrormsg", resultCode);
            const message = globalProp.Email.EmailFormat(globalProp.AccountValidation.API.Validate.Name, resultCode, strResult, serviceNumber);

            logger.error(`[ERROR CODE: ${resultCode}] ${strResult}`)
            emailLog.error(message);
        }

        let transition = 'failure';

        const accountNumber = conversation.properties().accountNumber;
        const serviceNumber = conversation.properties().serviceNumber;
        logger.addContext("serviceNumber", serviceNumber);
        emailLog.addContext("subject", globalProp.Email.Subjects.AccountValidation);
        emailLog.addContext("apiUrl", globalProp.Logger.BCPLogging.URL);
        emailLog.addContext("apiname", globalProp.Logger.BCPLogging.AppNames.AccountValidation);
        emailLog.addContext("usertelephonenumber", serviceNumber);
        emailLog.addContext("useraccountnumber", accountNumber);

        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        logger.info(`- [START] Account Validation                                                                                -`)
        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        
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
            if (error) {
                logError(error, error.code);
                
                conversation.variable('invalidacctmsg', error.message);
                transition = 'failure';                
            }
            else {
                logger.info(`Request success with Response Code: [${response.statusCode}]`);
                const strResponseBody = JSON.stringify(response.body);
                
                if (response.statusCode > 200) {
                    if (response.statusCode === 400) {
                        logger.error(`[ERROR CODE: ${response.statusCode}] ${strResponseBody}`)
                        console.log(response.statusCode + "Invalid Account Number or Telephone Number, Please try a different account.");
                        transition = 'invalidAcct';  
                    }
                    else{
                        logError(response.body, response.statusCode);
                        transition = 'failure'; 
                        switch(response.statusCode){
                            case 504:
                                logger.error(`[ERROR CODE: ${response.statusCode}] Internal Server Error Ecountered, Please try a different account.`);
                                break;
                            case 502:
                                logger.error(`[ERROR CODE: ${response.statusCode}] Bad Gateway Error, Please try again later.`);
                                break;
                            case 408:
                                logger.error(`[ERROR CODE: ${response.statusCode}] Invalid Account Number or Telephone Number, Please try a different account.`);
                                break;
                            case 500:
                                logger.error(`[ERROR CODE: ${response.statusCode}] Internal Server Error Ecountered, Please try a different account.`);
                                break;
                            case 599:
                                conversation.reply({ text: response.statusCode + "Network Connect Timeout Error, Please try again later." });
                                logger.error(`[ERROR CODE: ${response.statusCode}] Network Connect Timeout Error, Please try again later.`);
                                break;
                            default:
                                conversation.variable('invalidacctmsg', response.body.message);
                                logger.error(`[ERROR CODE: ${response.statusCode}] ${response.body.message}`);
                                break;
                        }                        
                    }
                }
                else {
                    const responseBody = JSON.parse(response.body);
                    logger.debug(`Response Body:  ${JSON.stringify(responseBody)}`);
                    logger.info(`Account is ${ responseBody.isValid ? 'valid': 'invalid'}.`)
                    if (responseBody.isValid === true) {
                        conversation.variable('validacctmsg', responseBody.message);
                        conversation.variable('withExtension', responseBody.extension);
                        if(responseBody.callType === null){                          
                            logger.warn(`Call Type: [No Call Type]`);  
                            conversation.variable('callType', 'No call type');
                            transition = 'validAcct';
                        }
                        else{
                            logger.info(`Call Type: [${responseBody.callType}]`);  
                            conversation.variable('callType', responseBody.callType);
                            transition = 'validAcct';
                        }
                    }
                    else {
                        conversation.variable('invalidacctmsg', responseBody.message);
                        transition = 'invalidAcct';
                    }                    
                }
            }
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Account Validation                                                                                  -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();
            _emailLog.shutdown();

            conversation.transition(transition);
            done();
        });
    }
};