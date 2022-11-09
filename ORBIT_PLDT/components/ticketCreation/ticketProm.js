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
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.TicketCreation.ticketProm);
        const logger = _logger.getLogger();

        logger.sendEmail = ((result, resultCode) => {
            const strResult = JSON.stringify(result);
            const message = globalProp.Email.EmailFormat(globalProp.TicketCreation.API.Validate.Name, resultCode, strResult, serviceNumber);
            logger.error(`[ERROR]: ${strResult}`);
            emailSender(globalProp.Email.Subjects.TicketCreation.TicketProm, message, globalProp.Logger.BCPLogging.AppNames.TicketCreation.TicketProm, strResult, resultCode, accntNumber, serviceNumber)
        })

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] Ticket Creation                                                                                   -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Ticket Creation                                                                                     -`)
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

        logger.debug(`Setting up the request body: ${requestBody}`);

        const options = globalProp.TicketCreation.API.Validate.PostOptions(requestBody);
        logger.debug(`Setting up the post option: ${JSON.stringify(options)}`);

        logger.info(`Starting to invoke the request.`)

        request(options, function (error, response) {
            if (error) {
                logger.sendEmail(error, error.code);
            }
            else {
                var createRes = response.body;
                var JSONRes = JSON.parse(createRes);

                if (response.statusCode > 200) {
                    if (response.statusCode === 406) {
                        if (JSONRes.spiel) {
                            console.log('Spiel is not null');
                            logger.debug('Spiel is not null');
                            conversation.variable('spielMsg', JSONRes.spiel);
                            logger.debug('Spiel is not null');
                            transition = 'FAILURE';
                        }
                        else {
                            console.log('Spiel is null');
                            logger.debug('Spiel is null');
                            conversation.variable('spielMsg', JSONRes.message);
                            transition = 'FAILURE';
                        }
                    }
                    else if (response.statusCode === 500) {
                        transition = '500';
                    }
                    else {
                        transition = 'FAILURE';
                    }
                    logger.sendEmail(response.body, response.statusCode);
                }
                else {
                    conversation.variable('spielMsg', JSONRes.spiel);
                    conversation.variable('ticketNumber', JSONRes.ticketNumber);
                    transition = 'SUCCESS';
                }
            }
            logger.end();
        });
    }
};