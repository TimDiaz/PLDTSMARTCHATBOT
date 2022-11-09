"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.FollowUpCase,
        properties: {
            accountNumber: {
                type: "string",
            },
            serviceNumber: {
                type: "string",
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
            OwnerId: {
                type: "string",
            },
            Subject: {
                type: "string",
            },
        },
        supportedActions: ['valid','invalid','failure']
    }),
    invoke: (conversation, done) => 
    {
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
        const ownerid = conversation.properties().OwnerId;
        const subj = conversation.properties().Subject;
        const channelType = conversation.request().message.channelConversation.channelType;
        const trimmeddesc = desc.replace("By providing us your information, you are allowing us to access your records and process your request.", " ");
        // #endregion

        // #region Imports
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const emailSender = require('../../helpers/emailsender');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.CaseCreation.FollowUpCase);
        const logger = _logger.getLogger();

        logger.sendEmail = ((result, resultCode) => {
            const strResult = JSON.stringify(result);
            const message = globalProp.Email.EmailFormat(globalProp.ChatAdCaseCreate.API.ChatAdToken.Name, resultCode, strResult, svcNumber);
            logger.error(`[ERROR]: ${strResult}`);            
            emailSender(globalProp.Email.Subjects.CaseCreation.FollowUpCase, message, globalProp.Logger.BCPLogging.AppNames.CaseCreation.FollowupCase, strResult, resultCode, accNumber, svcNumber)
        }) 

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`);
            logger.info(`- [START] Follow Up Case Creation                                                                           -`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`);
        });

        logger.end = (() => {
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`);
            logger.info(`- [END] Follow Up Case Creation                                                                             -`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`);

            _logger.shutdown();
        
            conversation.transition(transition);
            done();
        });


        let transition = '';

        logger.addContext("serviceNumber", svcNumber);
        // #endregion
        
        logger.start();

        var tokenOptions = globalProp.FollowUpCase.API.Token.PostOptions();
        logger.debug(`Setting up the post option for API Token: ${JSON.stringify(tokenOptions)}`);
        
        logger.info(`Starting to invoke the request for API Token.`);

        request(tokenOptions, function (error, result) {
            logger.info(`Invoking request successful.`);
            if (error) {
                logger.sendEmail(error, error.code);
                transition = 'failure';
                logger.end();
            }
            else {
                if(result.statusCode > 200){
                    logger.sendEmail(result.body, result.statusCode);
                    transition = 'failure';
                    logger.end()
                }
                else{
                    logger.info(`Request Token success with Response Code: [${result.statusCode}]`);
                    var parsedToken = JSON.parse(result.body)['access_token'];
                    var fullName = fName + " " + lName;
                    var rawToken = parsedToken.toString();
                    var token = rawToken.replace(/"([^"]+(?="))"/g, '$1');
                    logger.info(`Final Token: ${token}`);
                    const authBearer = "Authorization : Bearer " + token;

                    const requestBody = JSON.stringify({
                        'Description': trimmeddesc+',Fb Name: '+fullName +',fbid: '+fbId+',Channel Type: '+channelType,
                        'Type':sName,
                        'Status':'Open - Unassigned',
                        'Origin':'Facebook',
                        'RecordTypeId': recordTypeid,
                        'Subject': subj,
                        'PLDT_Case_Sub_Type__c': sMenu,
                        'Customer_City__c': city
                    });
                    
                    var options = globalProp.FollowUpCase.API.CaseCreate.PostOptions(authBearer, requestBody);
                    logger.debug(`Setting up the post option: ${JSON.stringify(options)}`);
            
                    logger.info(`Starting to invoke the request.`);
                    request(options, function (errorMsg, response) {
                        if (errorMsg){
                            logger.sendEmail(errorMsg, errorMsg.code);
                            transition = 'failure';                            
                        }else{
                            if(response.statusCode > 201){
                                logger.sendEmail(response.body, response.statusCode);
                                transition = 'failure';    
                            }else{                            
                                logger.info(`Invoking request successful.`);
                                logger.debug(`Request success with Status Code: [${response.statusCode}]`);
                                if(response.statusCode == 201){
                                    logger.info(`Successful Case Creation: ${response.body}`);
                                    transition = 'valid';
                                }else{ 
                                    logger.debug(`Case creation response Error: ${response.body}`);
                                    transition = 'failure';
                                }
                            }
                        }
                        logger.end();
                    });
                }
            }
        });
     }
};
    