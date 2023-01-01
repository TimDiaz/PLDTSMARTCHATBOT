"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.FollowUpDate,
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
        const _logger = instance.logger(globalProp.Logger.Category.CaseCreation.FollowUpDate);
        const logger = _logger.getLogger();

        logger.addContext("serviceNumber", serviceNumber);
        process.LoggerInstance(logger);

        logger.start = (() => {
            process.FollowupDateLoggerStart();
        });

        logger.end = (() => {
            process.FollowupLoggerEnd(transition);
            _logger.shutdown();
            conversation.transition(transition);
            done();
        });

        let transition = 'invalidDate';
        // #endregion

        logger.start();
        const result = process.FollowupDateLogic(userDate)
        transition = result.Transition;
        conversation.keepTurn(result.KeepTurn);
        logger.end();
    }
};


