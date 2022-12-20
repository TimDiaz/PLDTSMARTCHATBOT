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
        const process = require('../../businesslogics/accountValidation_logic');
        const api = require('../../http/accountValidation_http');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.AccountValidation);
        const logger = _logger.getLogger();

        logger.addContext("serviceNumber", serviceNumber);
        process.LoggerInstance(logger);
        api.LoggerInstance(logger);

        logger.sendEmail = ((result, resultCode) => {
            process.EmailSender(result, resultCode, serviceNumber, accountNumber);
        })

        logger.start = (() => {
            process.LoggerStart();
        });

        logger.end = (() => {
            process.LoggerEnd(transition);
            _logger.shutdown();
            conversation.transition(transition);
            done();
        });

        let transition = 'failure';
        // #endregion

        logger.start();

        api.PostRequest(accountNumber, serviceNumber, (error, response) => {
            if (error) {
                logger.sendEmail(error, error.code);

                conversation.variable('invalidacctmsg', error.message);
                transition = 'failure';
            }
            else {
                logger.info(`Request success with Response Code: [${response.statusCode}]`);

                const result = process.Process(response.statusCode, response.body, accountNumber, serviceNumber)
                transition = result.Transition;

                result.Reply.forEach(element => {
                    conversation.reply(element);
                });

                result.Variables.forEach(element => {
                    conversation.variable(element.name, element.value);
                });
            }
            logger.end();
        })
    }
};