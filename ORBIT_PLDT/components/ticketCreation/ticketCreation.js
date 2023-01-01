"use strict";
const componentName = require('../../configurations/component_config');
module.exports = {

    metadata: () => ({
        name: componentName.TicketCreation,
        properties: {
            description: {
                type: "string",
                required: true
            },
            empeId: {
                type: "string",
                required: true
            },
            faultType: {
                type: "string",
                required: true
            },
            priority: {
                type: "string",
                required: true
            },
            promCause: {
                type: "string",
                required: true
            },
            reportedBy: {
                type: "string",
                required: true
            },
            serviceNumber: {
                type: "string",
                required: true
            }
        },
        supportedActions: ['SUCCESS', 'FAILURE', '500']
    }),

    invoke: (conversation, done) => {
        // #region Setup Properties  
        var description = conversation.properties().description;
        var empeId = conversation.properties().empeId;
        var faultType = conversation.properties().faultType;
        var priority = conversation.properties().priority;
        var promCause = conversation.properties().promCause;
        var reportedBy = conversation.properties().reportedBy;
        var serviceNumber = conversation.properties().serviceNumber;
        var accntNumber = "NO DATA";
        // #endregion

        // #region Imports
        const process = require('../../businesslogics/ticketCreation_logic');
        const api = require('../../http/ticketCreation_http');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.TicketCreation.TicketCreation);
        const logger = _logger.getLogger();

        logger.addContext("serviceNumber", serviceNumber);
        process.LoggerInstance(logger);
        api.LoggerInstance(logger);

        logger.sendEmail = ((result, resultCode) => {
            process.CreationEmailSender(result, resultCode, serviceNumber, accntNumber);
        })

        logger.start = (() => {
            process.CreationLoggerStart();
        });

        logger.end = (() => {
            process.CreationLoggerEnd(transition);
            _logger.shutdown();
            conversation.transition(transition);
            done();
        });

        let transition = 'FAILURE';
        // #endregion

        logger.start();

        const requestBody = JSON.stringify({
            "description": description,
            "empeId": empeId,
            "faultType": faultType,
            "priority": priority,
            "promCause": promCause,
            "reportedBy": reportedBy,
            "telephoneNumber": serviceNumber
        });

        api.PostRequest(requestBody, 0, (error, response) => {
            if (error) {
                logger.email(error, error.code, accntNumber, serviceNumber);
            }
            else {
                logger.info(`Request success with Response Code: [${response.statusCode}]`);

                const result = process.CreationProcess(response.statusCode, response.body, accntNumber, serviceNumber)
                transition = result.Transition;

                result.Variables.forEach(element => {
                    conversation.variable(element.name, element.value);
                });
            }
            logger.end();
        });
    }
};