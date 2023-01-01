"use strict";
const componentName = require('../../configurations/component_config');
module.exports = {

    metadata: function metadata() {
        return {
            name: componentName.TicketCreationFT,
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
                    required: true
                },
                promWorgName: {
                    type: "string",
                    required: true
                },
                promCategory: {
                    type: "string",
                    required: true
                },
                promSubCategory: {
                    type: "string",
                    required: true
                },
                sysDate: {
                    type: "string",
                    required: true
                },
                accntNum: {
                    type: "string",
                    required: true
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
        var sysDate = conversation.properties().sysDate;
        var accntNumber = conversation.properties().accntNum;
        // #endregion

        // #region Imports
        const process = require('../../businesslogics/ticketCreation_logic');
        const api = require('../../http/ticketCreation_http');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.TicketCreation.ticketcreationcreateft);
        const logger = _logger.getLogger();

        logger.addContext("serviceNumber", serviceNumber);
        process.LoggerInstance(logger);
        api.LoggerInstance(logger);

        logger.sendEmail = ((result, resultCode) => {
            process.CreateFTEmailSender(result, resultCode, serviceNumber, accntNumber);
        })

        logger.start = (() => {
            process.CreateFTLoggerStart();
        });

        logger.end = (() => {
            process.CreateFTLoggerEnd(transition);
            _logger.shutdown();
            conversation.transition(transition);
            done();
        });

        function UpdateCreateFT(accNumberinit, telNumberinit, smpStartTsinit, ticketnumber, reportedBy, responseBody) {
            api.ChatbotUpdateRequest(accNumberinit, telNumberinit, smpStartTsinit, ticketnumber, reportedBy, responseBody)
        }        
        
        let transition = 'FAILURE';
        let retry = 0;
        const maxRetry = 3;
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

        var Process = () => {
            logger.info(`[RETRY] Counter : ${retry}`);
            api.PostRequest(requestBody, retry, (error, response) => {
                if (typeof (response.body) === "string" && response.body.match(/<html>/i)) {
                    logger.debug("[ERROR 500] Empty response from create ticket.");
                } else {
                    if (error) {
                        const errorreplaced = JSON.stringify(error).replace('http://', '');
                        retry++;
                        if (retry < maxRetry) {
                            Process();
                        }
                        else {
                            UpdateCreateFT(accntNumber, serviceNumber, sysDate, transition, reportedBy, errorreplaced);
                            logger.email(error, error.code, accntNumber, serviceNumber);
                        }
                    }
                    else {
                        logger.info(`Request success with Response Code: [${response.statusCode}]`);

                        const result = process.CreateFTProcess(response.statusCode, response.body, accntNumber, serviceNumber, reportedBy, sysDate)
                        transition = result.Transition;

                        result.Variables.forEach(element => {
                            conversation.variable(element.name, element.value);
                        });
                    }
                }
                logger.end();
            });
        };
        Process();

        // transition = 'SUCCESS';
        // conversation.variable('spielMsg', 'We have created a repair request to further check and resolve your concern We will provide updates if needed Thank you Reference number 9000000');
        // conversation.variable('ticketNumber', '9000000');
        // logger.end();
    }
};