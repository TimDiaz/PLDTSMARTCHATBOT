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
        const fetch = require('node-fetch');
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const emailSender = require('../../helpers/emailsender');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.TicketCreation.ticketcreationcreateft);
        const logger = _logger.getLogger();

        logger.sendEmail = ((result, resultCode) => {
            const strResult = JSON.stringify(result);
            const message = globalProp.Email.EmailFormat(globalProp.TicketCreation.API.Validate.Name, resultCode, strResult, serviceNumber);
            logger.error(`[ERROR]: ${strResult}`);
            emailSender(globalProp.Email.Subjects.TicketCreation.CreateFT, message, globalProp.Logger.BCPLogging.AppNames.TicketCreation.TicketCreationCreateFt, strResult, resultCode, accntNumber, serviceNumber)
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

        function UpdateCreateFT(aaccNumberinit, telNumberinit, smpStartTsinit, ticketnumber, reportedBy, responseBody) {
            logger.info(`[UPDATE CREATE FT REQUEST] ------------------------------------------------------------------------------------`);
            var options = globalProp.TicketCreation.API.UpdateCreateFt.PostOptions({
                "AccountNumber": aaccNumberinit,
                "TelephoneNumber": telNumberinit,
                "smpTS": smpStartTsinit,
                "TicketNumberCreateFT": ticketnumber,
                "ReportedBY": reportedBy,
                "ResponseBody": responseBody
            });
            logger.info(`[UPDATE CREATE FT REQUEST OPTION] ${JSON.stringify(options)}`);
            fetch(globalProp.TicketCreation.API.UpdateCreateFt.URL, options).then((response) => {
                if (response.status > 200) {
                    logger.error(`[UPDATE CREATE FT ERROR] ${response.statusText}`);
                } else {
                    logger.info(`[UPDATE CREATE FT RESPONSE] ${JSON.stringify(response)}`);
                }
            }).catch((error) => {
                logger.error(`[UPDATE CREATE FT ERROR] ${error}`);
            });
        }        
        
        let transition = 'FAILURE';
        let retry = 0;
        const maxRetry = 3;

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

        var Process = () => {
            logger.info(`[RETRY] Counter : ${retry}`);
            request(options, function (error, response) {
                if (typeof (response.body) === "string" && response.body.match(/<html>/i)) {
                    logger.debug("[ERROR 500] Empty response from create ticket.");
                    logger.end();
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
                            logger.end();
                        }
                    }
                    else {
                        var result = response;
                        var createRes = JSON.parse(result.body);
                        const responseStr = JSON.stringify(createRes).replace('http://', '');

                        if (result.statusCode > 200) {
                            logger.email(result.body, result.statusCode, accntNumber, serviceNumber)
                            if (result.statusCode === 406) {
                                logger.debug("Stringify createRes data 406 " + JSON.stringify(createRes));
                                var spiel406 = JSON.stringify(createRes.spiel).replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, '');
                                var msg406 = JSON.stringify(createRes.message).replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, '');
                                logger.debug("Stringify createRes data 406 testing2 pipe " + JSON.stringify(createRes) + " | " + spiel406 + " | " + msg406);

                                if (createRes.spiel) {
                                    UpdateCreateFT(accntNumber, serviceNumber, sysDate, "ERROR406", reportedBy, responseStr);
                                    logger.debug('Spiel is not null: ' + spiel406);
                                    conversation.variable('spielMsg', spiel406);
                                }
                                else {
                                    UpdateCreateFT(accntNumber, serviceNumber, sysDate, "ERROR406", reportedBy, responseStr);
                                    logger.debug('Spiel is null: ' + msg406);
                                    conversation.variable('spielMsg', msg406);
                                }
                            }
                            else if (result.statusCode === 500 || result.statusCode === 404) {
                                logger.debug("response error raw 500 || 404", JSON.stringify(result));
                                UpdateCreateFT(accntNumber, serviceNumber, sysDate, "ERROR500", reportedBy, responseStr);
                                transition = '500';
                            }
                            else {
                                logger.debug("response error raw else on 500 || 404", JSON.stringify(result));
                                UpdateCreateFT(accntNumber, serviceNumber, sysDate, "FAILURE", reportedBy, responseStr);
                            }
                        }
                        else {
                            logger.debug("Stringify createRes data: " + JSON.stringify(createRes));
                            logger.debug("Stringify createRes data ticketnumber: " + JSON.stringify(createRes.ticketNumber).replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, ''));
                            var tcktNum = JSON.stringify(createRes.ticketNumber).replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, '');
                            var spiel200 = JSON.stringify(createRes.spiel).replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, '');

                            if (tcktNum == null) {
                                var tcktNumData = JSON.stringify(result);
                                UpdateCreateFT(accntNumber, serviceNumber, sysDate, tcktNumData, reportedBy, responseStr);
                            } else {
                                var tcktNumData = tcktNum;
                                UpdateCreateFT(accntNumber, serviceNumber, sysDate, tcktNumData, reportedBy, responseStr);
                            }

                            logger.debug("raw result FLY = ", result);
                            logger.debug("spielMsg reply to Chat FLY= ", spiel200);
                            conversation.variable('spielMsg', spiel200);
                            conversation.variable('ticketNumber', tcktNum);
                            transition = 'SUCCESS';
                        }
                        logger.end();
                    }
                }
            });
        };
        Process();

        // transition = 'SUCCESS';
        // conversation.variable('spielMsg', 'We have created a repair request to further check and resolve your concern We will provide updates if needed Thank you Reference number 9000000');
        // conversation.variable('ticketNumber', '9000000');
        // logger.end();
    }
};