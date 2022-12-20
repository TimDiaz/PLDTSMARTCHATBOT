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
        supportedActions: ['undertreatment', 'withOpenParent', 'withOpenParentVC', 'withOpenParentCR', 'withOpenChildTicket', 'withOpenIndTicket', 'openorder', 'eligible', 'openso', 'notRBG', 'failure', 'invalidServiceNum']
    }),

    invoke: (conversation, done) => {
        // #region Setup Properties
        var serviceNumber = conversation.properties().serviceNumber;
        // #endregion

        // #region Imports
        const process = require('../../businesslogics/eligibility_logic');
        const api = require('../../http/accountEligibility_http');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.AccountEligibility);
        const logger = _logger.getLogger();

        logger.sendEmail = ((result, resultCode) => {
            process.EmailSender(result, resultCode, serviceNumber, 'NO DATA');
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

        logger.addContext("serviceNumber", serviceNumber);
        process.LoggerInstance(logger);
        api.LoggerInstance(logger);
        // #endregion

        logger.start();

        api.GetRequest(serviceNumber, (error, response) => {
            if (error) {
                logger.sendEmail(error, error.code)
                transition = 'failure';
            }
            else {
                const result = process.Process(response.statusCode, response.body, 'NO DATA', serviceNumber)
                transition = result.Transition;
                conversation.keepTurn(result.KeepTurn);
                result.Variables.forEach(element => {
                    conversation.variable(element.name, element.value);
                });
            }
            logger.end();
        });
    }
};