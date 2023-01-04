"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.ChatAdCaseCreate,
        properties: {
            accountNumber: {
                type: "string",
                required: true
            },
            serviceNumber: {
                type: "string",
                required: true
            },
            NeType: {
                type: "string",
            },
            message: {
                type: "string",
            },
            customerCity: {
                type: "string",
            },
            firstName: {
                type: "string",
            },
            lastName: {
                type: "string",
            },
            userId: {
                type: "string",
            },
            skillName: {
                type: "string",
                required: true
            },
            subMenu: {
                type: "string",
                required: true
            },
            email: {
                type: "string",
            },
            RecordTypeId: {
                type: "string",
            },
            ChatAdId: {
                type: "string",
            },
            OwnerId: {
                type: "string",
            },
            Subject: {
                type: "string",
            },
            fbChatAdId: {
                type: "string",
            },
            caseOrigin: {
                type: "string",
            },
            streetAddress: {
                type: "string",
            },
        },
        supportedActions: ['valid', 'invalid', 'failure']
    }),

    invoke: (conversation, done) => {
        // #region Setup Properties
        const accNumber = conversation.properties().accountNumber;
        const svcNumber = conversation.properties().serviceNumber;
        const desc = conversation.properties().message;
        const city = conversation.properties().customerCity;
        const fName = conversation.properties().firstName;
        const lName = conversation.properties().lastName;
        const sMenu = conversation.properties().subMenu;
        const fbId = conversation.request().message.channelConversation.userId;
        const uId = conversation.properties().userId;
        const lemail = conversation.properties().email;
        const sName = conversation.properties().skillName;
        const recordTypeid = conversation.properties().RecordTypeId;
        const chatAdId = conversation.properties().ChatAdId;
        const ownerid = conversation.properties().OwnerId;
        const subj = conversation.properties().Subject;
        const channelType = conversation.request().message.channelConversation.channelType;
        const fbChatAdId = conversation.properties().fbChatAdId;
        const caseOrigin = conversation.properties().caseOrigin;
        const streetAddress = conversation.properties().streetAddress;
        // #endregion

        // #region Imports
        const request = require('request');
        const process = require('../../businesslogics/caseCreation_logic');
        const api = require('../../http/caseCreation_http');
        const globalProp = require('../../helpers/globalProperties');
        const emailSender = require('../../helpers/emailsender');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.CaseCreation.ChatAdCaseCreate);
        const logger = _logger.getLogger();

        logger.addContext("serviceNumber", svcNumber);
        process.LoggerInstance(logger);
        api.LoggerInstance(logger);

        logger.sendEmail = ((result, resultCode) => {
            process.ChatAdCaseCreateEmailSender(result, resultCode, svcNumber, accNumber);
        })

        logger.start = (() => {
            process.ChatAdCaseCreateLoggerStart()
        });

        logger.end = (() => {
            process.ChatAdCaseCreateLoggerEnd(transition);
            _logger.shutdown();
            conversation.transition(transition);
            done();
        });

        let transition = 'failure';
        // #endregion

        logger.start();

        api.ChatAdCaseCreateTokenRequest((errorT, responseT) => {
            if (errorT) {
                logger.sendEmail(errorT, errorT.code);
                logger.end();
            } else {
                const tokenResult = process.ChatAdCaseCreateTokenLogic(responseT.statusCode, responseT.body, accNumber, svcNumber);
                if (tokenResult.AuthBearer == '') {
                    logger.end();
                }
                else {
                    const requestBody = JSON.stringify({
                        'Description': desc,
                        'Type': sName,
                        'Status': 'Open - Unassigned',
                        'Origin': 'FB Chat Ad',
                        'RecordTypeId': recordTypeid,
                        'Subject': subj,
                        'PLDT_Case_Sub_Type__c': sMenu,
                        'Customer_City__c': city,
                        "Chat_Ad_ID__c": fbChatAdId
                    });

                    api.ChatAdCaseCreateRequest(tokenResult.AuthBearer, requestBody, (error, response) => {
                        if (error) {
                            logger.sendEmail(response, response.statusCode);
                        } else {
                            logger.info(`Request success with Response Code: [${response.statusCode}]`);

                            const result = process.ChatAdCaseCreateLogic(response.statusCode, response.body, accNumber, svcNumber)
                            transition = result.Transition;
                        }
                        logger.end();
                    });
                }
            }
        });
    }
};
