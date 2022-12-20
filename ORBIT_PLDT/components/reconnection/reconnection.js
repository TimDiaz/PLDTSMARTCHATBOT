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
        const process = require('../../businesslogics/reconnection_logic');
        const api = require('../../http/reconnection_http');
        const globalProp = require('../../helpers/globalProperties');
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

        logger.sendEmail = ((subject, result, resultCode) => {
            process.EmailSender(subject, result, resultCode, serviceNumber, accountNumber);
        })

        logger.start = (() => {
            process.LoggerStart();
        });

        logger.end = (() => {
            process.LoggerEnd(transition);
            _logger.shutdown();
            conversation.transition(transition);
            done();
        });


        logger.insertData = ((responseType, telephoneNumber, accountNumber, responseBody) => {
            api.LogResponse(responseType, telephoneNumber, accountNumber, responseBody) 
        });


        let transition = '406State';

        logger.addContext("serviceNumber", telephoneNumber);
        process.LoggerInstance(logger);
        api.LoggerInstance(logger);
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
        api.PostRequest(requestBody, (error, response) => {
            if (error) {
                process.EmailSender('[API Error] Reconnection PROD - Cannot Reconnect User', body, statusCode, telephoneNumber, accountNumber)
                api.LogResponse(1000, telephoneNumber, accountNumber, erroremailmsg)
            }
            else 
            {
                logger.info(`Request success with Response Code: [${response.statusCode}]`);

                const result = process.Process(response.statusCode, response.body, accountNumber, telephoneNumber)
                transition = result.Transition;               
            }
            logger.end();
        });
    }
};