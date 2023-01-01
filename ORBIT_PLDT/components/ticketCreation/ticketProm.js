"use strict";
const componentName = require('../../configurations/component_config');

module.exports = {

    metadata: function metadata() {
        return {
            name: componentName.TicketCreationProm,
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
                },
                promSubType: {
                    type: "string",
                    required: false
                },
                promWorgName: {
                    type: "string",
                    required: false
                },
                promCategory: {
                    type: "string",
                    required: false
                },
                promSubCategory: {
                    type: "string",
                    required: false
                }
            },
            supportedActions: ['SUCCESS', 'FAILURE', '500']
        };
    },

    invoke: (conversation, done) => {

        // #region Setup Properties  
        var description = conversation.properties().description;
        var empeId = conversation.properties().empeId;
        var faultType = conversation.properties().faultType;
        var priority = conversation.properties().priority;
        var promCause = conversation.properties().promCause;
        var reportedBy = conversation.properties().reportedBy;
        var serviceNumber = conversation.properties().serviceNumber;
        var promSubType = conversation.properties().promSubType;
        var promWorgName = conversation.properties().promWorgName;
        var promCategory = conversation.properties().promCategory;
        var promSubCategory = conversation.properties().promSubCategory;
        var accntNumber = conversation.properties().accntNum;
        // #endregion

        // #region Imports
        const request = require('request');
        const process = require('../../businesslogics/ticketCreation_logic');
        const api = require('../../http/ticketCreation_http');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.TicketCreation.ticketProm);
        const logger = _logger.getLogger();

        logger.addContext("serviceNumber", serviceNumber);
        process.LoggerInstance(logger);
        api.LoggerInstance(logger);

        logger.sendEmail = ((result, resultCode) => {
            process.PromEmailSender(result, resultCode, serviceNumber, accntNumber);
        })

        logger.start = (() => {
            process.PromLoggerStart();
        });

        logger.end = (() => {
            process.PromLoggerEnd(transition);
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
            "telephoneNumber": serviceNumber,
            "promSubType": promSubType,
            "promWorgName": promWorgName,
            "promCategory": promCategory,
            "promSubCategory": promSubCategory
        });

        api.PostRequest(requestBody, 0, (error, response) => {
            if (error) {
                logger.email(error, error.code, accntNumber, serviceNumber);
            }
            else {
                logger.info(`Request success with Response Code: [${response.statusCode}]`);

                const result = process.PromProcess(response.statusCode, response.body, accntNumber, serviceNumber)
                transition = result.Transition;

                result.Variables.forEach(element => {
                    conversation.variable(element.name, element.value);
                });
            }
            logger.end();
        });
    }
};