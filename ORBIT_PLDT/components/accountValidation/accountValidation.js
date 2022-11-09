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
        // #region Setup Properties  
        const accountNumber = conversation.properties().accountNumber;
        const serviceNumber = conversation.properties().serviceNumber;
        // #endregion

        // #region Imports
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const emailSender = require('../../helpers/emailsender');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.AccountValidation);
        const logger = _logger.getLogger();

        logger.sendEmail = ((result, resultCode) => {
            const strResult = JSON.stringify(result);
            const message = globalProp.Email.EmailFormat(globalProp.AccountValidation.API.Validate.Name, resultCode, strResult, serviceNumber);
            logger.error(`[ERROR]: ${strResult}`);
            emailSender(globalProp.Email.Subjects.AccountValidation, message, globalProp.Logger.BCPLogging.AppNames.AccountValidation, strResult, resultCode, accountNumber, serviceNumber)
        })

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] Account Validation                                                                                -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Account Validation                                                                                  -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();

            conversation.transition(transition);
            done();
        });

        let transition = 'failure';

        logger.addContext("serviceNumber", serviceNumber);
        // #endregion

        logger.start();

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
                logger.sendEmail(error, error.code);

                conversation.variable('invalidacctmsg', error.message);
                transition = 'failure';
                logger.end();
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
                    else {
                        logger.sendEmail(response.body, response.statusCode);
                        transition = 'failure';
                        switch (response.statusCode) {
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
                    logger.info(`Account is ${responseBody.isValid ? 'valid' : 'invalid'}.`)
                    if (responseBody.isValid === true) {
                        conversation.variable('validacctmsg', responseBody.message);
                        conversation.variable('withExtension', responseBody.extension);
                        if (responseBody.callType === null) {
                            logger.warn(`Call Type: [No Call Type]`);
                            conversation.variable('callType', 'No call type');
                            transition = 'validAcct';
                        }
                        else {
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
            logger.end();
        });
    }
};