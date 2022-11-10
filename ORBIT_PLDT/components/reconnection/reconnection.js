"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.Reconnection,
        properties: {
            accountNumber: {
                type: "string",
                required: true
            },
            telephoneNumber: {
                type: "string",
                required: true
            },
            requestDate: {
                type: "date",
                required: true
            },
            amount: {
                type: "string",
                required: true
            },
            firstName: {
                type: "string",
                required: true
            },
            lastName: {
                type: "string",
                required: true
            },
            refNo: {
                type: "string",
                required: true
            }
        },
        supportedActions: [
            'acceptedRequest',
            'connectCSRMsg',
            'ongoingProcess',
            'additionalReq',
            '406State'
        ]
    }),

    invoke: (conversation, done) => {
        // #region Imports
        const moment = require('moment');        
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const emailSender = require('../../helpers/emailsender');
        const instance = require("../../helpers/logger");
        // #endregion

        var accountNumber = conversation.properties().accountNumber;
        var telephoneNumber = conversation.properties().telephoneNumber;
        var lastName = null;
        var processType = "CHATBOT";
        var reconnectReason = "P2P";
        var priName = null;
        var requestDate = conversation.properties().requestDate;
        var amount = conversation.properties().amount;
        var priName2 = null;
        var withReconnectFee = 0;
        var contactNo2 = null;
        var stmtFaxNo = null;
        var refNo = conversation.properties().refNo;
        var frstName = conversation.properties().firstName;
        var lstName = conversation.properties().lastName;
        var formDate = moment(requestDate).format('yyyymmdd');
        var arr = new Array(frstName + lstName, refNo, requestDate);
        var arrayEmail = arr.join(",");

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.Reconnection);
        const logger = _logger.getLogger();

        logger.sendEmail = ((result, resultCode, subject) => {
            const strResult = JSON.stringify(result);
            const message = globalProp.Email.EmailFormat(globalProp.Reconnection.API.Name, resultCode, strResult, telephoneNumber);
            logger.error(`[ERROR]: ${strResult}`);
            emailSender(subject, message, globalProp.Logger.BCPLogging.AppNames.Reconnection, strResult, resultCode, accountNumber, telephoneNumber)
        })

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] Reconnection                                                                                      -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Reconnection                                                                                        -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();

            conversation.transition(transition);
            done();
        });


        logger.insertData = ((responseType, telephoneNumber, accountNumber, responseBody) => {
            var body = JSON.stringify({
                "responseType": responseType,
                "telephoneNumber": telephoneNumber,
                "accountNumber": accountNumber,
                "responseBody": responseBody
            });

            var options = globalProp.Reconnection.API.InsertDataOptions(body);
            request(options, function (error, response) {
                if (error) {
                    logger.error(`[SUCCESSFUL] ${error}`);
                } else {
                    logger.info(`[SUCCESSFUL] ${response.body}`);
                }
            });    
        });


        let transition = '406State';

        logger.addContext("serviceNumber", telephoneNumber);
        // #endregion

        logger.start();

        var requestBody = JSON.stringify({
            "accountNumber": accountNumber.toString(),
            "serviceNumber": telephoneNumber,
            "lastName": lstName.toString(),
            "processType": processType.toString(),
            "reconnectReason": reconnectReason.toString(),
            "priName": priName,
            "requestDate": formDate.toString(),
            "amount": "20000",
            "email": arrayEmail.toString(),
            "priName2": priName2,
            "withReconnectFee": withReconnectFee.toString(),
            "contactNo2": contactNo2,
            "stmtFaxNo": stmtFaxNo

        });
        const options = globalProp.Reconnection.API.PostOptions(requestBody);
        logger.debug(`Setting up the get option: ${JSON.stringify(options)}`);

        logger.info(`Starting to invoke the request.`)
        request(options, function (error, response) {
            if (error) {
                logger.sendEmail(error, error.code, '[API Error] Reconnection PROD - Cannot Reconnect User')
                logger.insertData(1000, telephoneNumber, accountNumber, erroremailmsg)
                logger.end();
            }
            else 
            {
                if (response.statusCode > 202) {
                    logger.sendEmail(response.body, response.statusCode, '[API Error] Reconnection PROD - Cannot Reconnect User')
                    logger.insertData(response.statusCode, telephoneNumber, accountNumber, JSON.stringify(response.body))
                }
                else {
                    var error = {
                        error: '',
                        statusCode: ''
                    }

                    var res = JSON.parse(response.body)['result'];
                    var raw = res.includes('|') ? parseInt(res[0]) : parseInt(res);

                    logger.info(`[RESULT] ${res}`);
                    logger.info(`[RAW] ${raw}`);
                    if (raw == 0 || raw == 1) {
                        transition = 'acceptedRequest';
                        logger.info(`[ACCEPTED REQUEST] ${raw} [ACCOUNT NUMBER] ${accountNumber}`);
                    }
                    else if (raw == 2) {
                        transition = 'ongoingProcess';
                        logger.info(`[ONGOING REQUEST] ${raw} [ACCOUNT NUMBER] ${accountNumber}`);
                    }
                    else if (raw == 4) {
                        transition = 'withOpenSO';
                        logger.info(`[WITH OPEN SO] ${raw} [ACCOUNT NUMBER] ${accountNumber}`);
                    }
                    else if (raw == 3) {
                        error.error = 'API return 3';
                        error.statusCode = '200'
                        transition = 'connectCSRMsg';
                        logger.info(`[CONNECT CR MESSAGE] ${raw} [ACCOUNT NUMBER] ${accountNumber}`);
                        logger.sendEmail(error, error.statusCode, '[API Error] Reconnection PROD - API Return 3 (fallout)')
                    }
                    else if (raw == 5 || raw == 6 || raw == 7) {
                        transition = 'additionalReq';
                        logger.info(`[ADDITIONAL REQUEST] ${raw} [ACCOUNT NUMBER] ${accountNumber}`);
                    }
                    else {
                        error.error = 'outside of Recon Matrix';
                        error.statusCode = '406'

                        transition = '406State';
                        logger.info(`[OUTSIDE OF RECONNECTION MATRIX] ${raw}`);
                        logger.sendEmail(error, error.statusCode, '[API Error] Reconnection PROD - Cannot Reconnect User')
                    }

                    logger.insertData(raw, telephoneNumber, accountNumber, JSON.stringify(response.body))
                }
                logger.end();
            }
        });
    }
};