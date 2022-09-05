"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.NumberServiceabilityPARAM, //"getParam",
        properties: {
            serviceNumber: {
                type: "string",
                required: true
            }
        },
        supportedActions: ['failure', 'blank', 'param3', 'VipZone']
    }),

    invoke: (conversation, done) => {
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        const _logger = instance.logger(globalProp.Logger.Category.NumberServiceabilityParam);
        const logger = _logger.getLogger();
        const _emailLog = instance.logger(globalProp.Logger.Category.Mailer);        
        const emailLog = _emailLog.getLogger();

        function logError(result, resultCode) {
            const strResult = JSON.stringify(result);
            emailLog.addContext("apierrorcode", strResult);
            emailLog.addContext("apierrormsg", resultCode);
            const message = globalProp.Email.EmailFormat(globalProp.NumberServiceability.API.Serviceable.Name, resultCode, strResult, serviceNumber);

            logger.error(`[ERROR CODE: ${resultCode}] ${strResult}`)
            emailLog.error(message);
        }

        let transition = 'failure';

        var serviceNumber = conversation.properties().serviceNumber;
        var areacode = "";
        var telephone = "";
        var accountNumber = "No Data";
        logger.addContext("serviceNumber", serviceNumber)
        emailLog.addContext("subject", globalProp.Email.Subjects.NumberServiceabilityParam);
        emailLog.addContext("apiUrl", globalProp.Logger.BCPLogging.URL);
        emailLog.addContext("apiname", globalProp.Logger.BCPLogging.AppNames.NumberServiceability.Param);
        emailLog.addContext("usertelephonenumber", serviceNumber);
        emailLog.addContext("useraccountnumber", accountNumber);

        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        logger.info(`- [START] Number Serviceability - [PARAM]                                                                   -`)
        logger.info(`-------------------------------------------------------------------------------------------------------------`)

        if (serviceNumber.length == 9) {
            areacode = serviceNumber.substring(2, 0);
            telephone = serviceNumber.substring(2);
        }
        else {
            if (serviceNumber.substring(3, 0) == '028') {
                areacode = serviceNumber.substring(2, 0);
                telephone = serviceNumber.substring(2);
            }
            else {
                areacode = serviceNumber.substring(3, 0);
                telephone = serviceNumber.substring(3);
            }
        }
        logger.debug(`Area Code: [${areacode}].`)
        logger.debug(`Telephone: [${telephone}].`)

        const requestBody = JSON.stringify({
            "AREACODE": areacode,
            "TELEPHONE": telephone,
            "CONSUMER": globalProp.NumberServiceability.API.Serviceable.Consumer,
            "TOKEN": globalProp.NumberServiceability.API.Serviceable.Token
        });
        logger.debug(`Setting up the request body: ${requestBody}`);

        var options = globalProp.NumberServiceability.API.Serviceable.PostOptions(requestBody);
        logger.debug(`Setting up the post option: ${JSON.stringify(options)}`);

        logger.info(`Starting to invoke the request.`)
        request(options, function (error, response) {
            logger.info(`Invoking request successful.`)
            if (error) {
                logError(error, error.code);
                transition = 'failure';
            }
            else {
                logger.info(`Request success with Response Code: [${response.statusCode}]`);
                var responseBody = response.body;
                
                if (response.statusCode > 200) {
                    var statCode = response.statusCode;
                    logError(responseBody, statCode);
                    transition = 'failure';
                    switch(statCode)
                    {
                        case 504: case 406: case 500: case 404: case 408: case 400:
                            conversation.variable('errorCode', statCode);
                            break;
                    }
                }
                else {
                    var JSONRes = JSON.parse(responseBody);

                    logger.debug(`Response Body:  ${JSON.stringify(JSONRes)}`);
                    var paramcity = JSONRes.PARAM3.toUpperCase().toString();
                    var param1 = JSONRes.PARAM1.toUpperCase().toString();
                    var fullcity = param1 + "-" + paramcity;

                    logger.debug(`City Code: [${param1}].`);
                    logger.debug(`City: [${paramcity}].`);
                    logger.debug(`Full City: [${fullcity}].`);

                    if (JSONRes.EXCEPTIONMSG !== null || JSONRes.EXCEPTIONMSG !== undefined || JSONRes.EXCEPTIONMSG !== '') {
                        transition = 'blank';
                        switch (JSONRes.EXCEPTIONMSG) {
                            case "100|TELEPHONE NUMBER DOES NOT EXIST":
                                conversation.variable('PARAM3', fullcity);
                                logger.debug(`Telephone number does not exist service number: [${serviceNumber}].`);
                                break;
                            default:
                                conversation.variable('PARAM3', fullcity);
                                logger.debug(`CLARITY ERROR. Server was unable to process request: [${paramcity}].`);
                                break;
                        }
                    }
                    else {
                        if (paramcity === null || paramcity === undefined || paramcity === '') {
                            conversation.variable('PARAM3', fullcity);
                            transition = 'blank';
                        }
                        else if (paramcity !== null || paramcity !== undefined || paramcity !== ''){
                            switch(paramcity)
                            {
                                case "VALENZUELA CITY":
                                    conversation.variable('PARAM3', fullcity);
                                    transition = 'param3';
                                    break;
                                default:
                                    conversation.variable('PARAM3', fullcity);
                                    transition = 'VipZone';
                                    break;
                            }
                        }
                        else{
                            conversation.variable('neType', "NULL NE TYPE");
                            conversation.variable('PARAM3',fullcity);
                            transition = 'blank';
                            console.log(" GET PARAM Component , blank argument service number:" + serviceNumber, "PARAM3: ", fullcity);
                        }
                    }
                }
            }
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Number Serviceability - [PARAM]                                                                     -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            _logger.shutdown();
            _emailLog.shutdown();

            conversation.transition(transition);
            done();
        });
    }
};