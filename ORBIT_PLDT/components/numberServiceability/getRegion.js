"use strict";

const componentName = require('../../configurations/component_config');

module.exports = {
    metadata: () => ({
        name: componentName.NumberServiceabilityRegion,
        properties: {
            serviceNumber: {
                type: "string",
                required: true
            }
        },
        supportedActions: ['LUZON', 'VIZMIN', 'METRO', 'blank', 'failure']
    }),

    invoke: (conversation, done) => {

        // #region Setup Properties 
        var serviceNumber = conversation.properties().serviceNumber;
        // #endregion

        // #region Imports
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const emailSender = require('../../helpers/emailsender');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.NumberServiceability.NumberServiceabilityRegion);
        const logger = _logger.getLogger();
        
        logger.sendEmail = ((result, resultCode) => {
            const strResult = JSON.stringify(result);
            const message = globalProp.Email.EmailFormat(globalProp.NumberServiceability.API.Serviceable.Name, resultCode, strResult, serviceNumber);
            logger.error(`[ERROR]: ${strResult}`);
            emailSender(globalProp.Email.Subjects.NumberServiceability.Region, message, globalProp.Logger.BCPLogging.AppNames.NumberServiceability.Region, strResult, resultCode, "NO DATA", serviceNumber)
        })

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] Number Serviceability - [Region]                                                                  -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Number Serviceability - [Region]                                                                    -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();
            conversation.transition(transition);
            done();
        });
        
        let transition = 'failure';
        var areacode = "";
        var telephone = "";
        var accountNumber = "No Data";
        logger.addContext("serviceNumber", serviceNumber)
        // #endregion

        logger.start();        

        logger.debug("info from bot:" + serviceNumber)
        if (serviceNumber.length == 9) {
            var areacode = serviceNumber.substring(2, 0);
            var telephone = serviceNumber.substring(2);
        }
        else {
            if (serviceNumber.substring(3, 0) == '028') {
                var areacode = serviceNumber.substring(2, 0);
                var telephone = serviceNumber.substring(2);
                logger.debug("Area Code 02: ", areacode);
                logger.debug("Telephone Number 02: ", telephone);
            }
            else {
                var areacode = serviceNumber.substring(3, 0);
                var telephone = serviceNumber.substring(3);
                logger.debug("Area Code 028: ", areacode);
                logger.debug("Telephone Number 028: ", telephone);
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
                logger.sendEmail(error, error.code);
                transition = 'failure';
            }
            else {
                if (response.statusCode > 200) {
                    logger.sendEmail(response.body, response.statusCode);
                    transition = 'failure';
                }
                else {
                    logger.info(`Request success with Response Code: [${response.statusCode}]`);
                    var responseBody = response.body;
                    var JSONRes = JSON.parse(responseBody);
                    logger.debug(`Response Body:  ${JSON.stringify(JSONRes)}`);
                    // send line capability validation
                    var lineCapability = JSONRes.LINECAPABILITY.toUpperCase();
                    if (lineCapability == "NO LINE CAPABILITY") {
                        conversation.variable('lineCapability', lineCapability);

                    } else {
                        conversation.variable('lineCapability', lineCapability);

                    }
                    // end line capability

                    var parameter_city = JSONRes.PARAM2.toUpperCase();
                    logger.debug("PARAM2 :", parameter_city);
                    var PARAM2 = parameter_city;
                    function titleCase(str) {
                        var splitStr = str.toLowerCase().split(' ');
                        for (var i = 0; i < splitStr.length; i++) {
                            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
                        }
                        return splitStr.join(' ');
                    }

                    if (parameter_city == "VISAYAS") {
                        conversation.variable('PARAM2', PARAM2);
                        //conversation.transition('VIZMIN');
                        transition = 'VIZMIN';
                        //done();
                    }
                    else if (parameter_city == "SOUTH MINDANAO" || parameter_city == "NORTH MINDANAO") {
                        conversation.variable('PARAM2', PARAM2);
                        //conversation.transition('VIZMIN');
                        transition = 'VIZMIN';
                        //done();
                    }
                    else if (parameter_city == "SOUTH LUZON" || parameter_city == "NORTH LUZON") {
                        conversation.variable('PARAM2', PARAM2);
                        //conversation.transition('LUZON');
                        transition = 'LUZON';
                        //done();
                    }
                    else if (parameter_city == "GMM NORTH" || parameter_city == "GMM SOUTH" || parameter_city == "GMM EAST" || parameter_city == "GMM WEST") {
                        conversation.variable('PARAM2', PARAM2);
                        //conversation.transition('METRO');
                        transition = 'METRO';
                        //done();
                    }
                    else if (parameter_city == null) {
                        conversation.variable('PARAM2', PARAM2);
                        //conversation.transition('blank');
                        transition = 'blank';
                        //done();
                    }
                    else if (JSONRes.EXCEPTIONMSG == "100|TELEPHONE NUMBER DOES NOT EXIST") {
                        logger.debug("getRegion telephone number does not exist service number:" + serviceNumber);
                        conversation.variable('PARAM2', PARAM2);
                        //conversation.transition('blank');
                        transition = 'blank';
                        //done();
                    }
                    else if (JSONRes.EXCEPTIONMSG !== "100|TELEPHONE NUMBER DOES NOT EXIST") {
                        conversation.variable('PARAM2', PARAM2);
                        //conversation.transition('blank');
                        transition = 'blank';
                        logger.debug("getRegion - CLARITY ERROR. Server was unable to process request.:" + serviceNumber, "parameter_city :" + parameter_city);
                        //done();
                    }
                    else {
                        conversation.variable('neType', "NULL NE TYPE");
                        conversation.variable('PARAM2', PARAM2);
                        conversation.transition('blank');
                        transition = 'blank';
                        logger.debug("getRegion component ,blank argument service number:" + serviceNumber, "PARAM2: " + PARAM2);
                        //done();
                    }
                }
            }
            logger.end();
        });
    }
};