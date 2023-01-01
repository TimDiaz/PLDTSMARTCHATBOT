"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.PaymentDate,
        properties: {
            serviceNumber: {
                type: "string",
                required: true
            },
            requestDate: {
                type: "date",
                required: true
            },
        },
        supportedActions: ['validDate', 'invalidDate', 'invalidFutureDate', 'failure', 'InvalidDateFormat']
    }),
    invoke: (conversation, done) => {
        // #region Setup Properties
        const serviceNumber = conversation.properties().serviceNumber;
        const userDate = conversation.properties().requestDate;
        // #endregion

        // #region Imports
        const process = require('../../businesslogics/caseCreation_logic');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.CaseCreation.PaymentDate);
        const logger = _logger.getLogger();

        logger.addContext("serviceNumber", serviceNumber);
        process.LoggerInstance(logger);

        logger.start = (() => {
            process.PaymentDateLoggerStart();
        });

        logger.end = (() => {
            process.PaymentDateLoggerEnd(transition);
            _logger.shutdown();
            conversation.transition(transition);
            done();
        });

        let transition = 'invalidDate';
        // #endregion

        logger.start();
        const result = process.PaymentDateLogic(userDate)
        transition = result.Transition;
        conversation.keepTurn(result.KeepTurn);
        logger.end();
    }
};


