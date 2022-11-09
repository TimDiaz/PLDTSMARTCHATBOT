"use strict";
const componentName = require('../../configurations/component_config');

module.exports = {

    metadata: function metadata() {
        return {
            name: componentName.NumberServiceabilityTechnology,
            properties: {
                serviceNumber: {
                    type: "string",
                    required: true
                }
            },
            supportedActions: ['dslAcct', 'fibrAcct', 'failure', 'blank']
        };
    },

    invoke: (conversation, done) => {

        // #region Setup Properties 
        var serviceNumber = conversation.properties().serviceNumber;
        // #endregion

        // #region Imports
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.NumberServiceability.NumberServiceabilityTechnology);
        const logger = _logger.getLogger();

        logger.sendEmail = ((result, resultCode) => {
            const strResult = JSON.stringify(result);
            const message = globalProp.Email.EmailFormat(globalProp.NumberServiceability.API.Serviceable.Name, resultCode, strResult, serviceNumber);
            logger.error(`[ERROR]: ${strResult}`);
            emailSender(globalProp.Email.Subjects.NumberServiceability.Technology, message, globalProp.Logger.BCPLogging.AppNames.NumberServiceability.Technology, strResult, resultCode, "NO DATA", serviceNumber)
        })

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] Number Serviceability - [Technology]                                                              -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Number Serviceability - [Technology]                                                                -`)
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
            }

            else if (serviceNumber.substring(3, 0) == '034') { // start here  ---> capture 034
                var areacode = serviceNumber.substring(3, 0);
                var telephone = serviceNumber.substring(3);

                logger.debug("3rd argument areacode: ", areacode, "telephone number: ", telephone);
            }
            else {
                var areacode = serviceNumber.substring(3, 0);
                var telephone = serviceNumber.substring(3);
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
                    var pkgfttx = "FTTX";
                    var pkgftth = "FTTH";
                    var pkgfiber = "FIBER";
                    var pkgfibr = "FIBR";
                    var pkgdsl = "DSL";
                    var pkgvdsl = "VDSL";
                    var pkgngn = "NGN";
                    var pkglegacy = "LEGACY";
                    logger.debug(`Response Body:  ${JSON.stringify(JSONRes)}`);

                    var currentTech = JSONRes.CURRENTTECHNOLOGY.toUpperCase();
                    logger.debug(currentTech);
                    if (currentTech == pkgfttx) {
                        conversation.variable('neType', pkgfttx);
                        //conversation.transition('fibrAcct');
                        transition = 'fibrAcct';
                        //done();
                    }

                    else if (currentTech == pkgfiber) {
                        conversation.variable('neType', pkgfiber);
                        //conversation.transition('fibrAcct');
                        transition = 'fibrAcct';
                        //done();
                    }

                    else if (currentTech == pkgfibr) {
                        conversation.variable('neType', pkgfibr);
                        //conversation.transition('fibrAcct');
                        transition = 'fibrAcct';
                        //done();
                    }

                    else if (currentTech == pkgftth) {
                        conversation.variable('neType', pkgftth);
                        //conversation.transition('fibrAcct');
                        transition = 'fibrAcct';
                        //done();
                    }

                    else if (currentTech == pkgdsl) {
                        conversation.variable('neType', pkgdsl);
                        //conversation.transition('dslAcct');
                        transition = 'dslAcct';
                        //done();
                    }

                    else if (currentTech == pkgvdsl) {
                        conversation.variable('neType', pkgvdsl);
                        //conversation.transition('dslAcct');
                        transition = 'dslAcct';
                        //done();
                    }

                    else if (currentTech == pkgngn) {
                        conversation.variable('neType', pkgngn);
                        //conversation.transition('dslAcct');
                        transition = 'dslAcct';
                        //done();
                    }

                    else if (currentTech == pkglegacy) {
                        conversation.variable('neType', pkglegacy);
                        //conversation.transition('dslAcct');
                        transition = 'dslAcct';
                        //done();
                    }
                    else if (JSONRes.EXCEPTIONMSG == "100|TELEPHONE NUMBER DOES NOT EXIST") {
                        logger.debug("getTechnology telephone number does not exist service number:" + serviceNumber, "currentTech : " + currentTech);
                        logger.debug("getTechnology telephone number does not exist service number:" + serviceNumber, "currentTech : " + currentTech);
                        //conversation.transition('blank');
                        transition = 'blank';
                        //done();
                    }
                    else if (JSONRes.EXCEPTIONMSG !== "100|TELEPHONE NUMBER DOES NOT EXIST") {
                        //conversation.transition('blank');
                        transition = 'blank';
                        logger.debug("getTechnology - number CLARITY ERROR. Server was unable to process request." + serviceNumber, "currentTech : " + currentTech);
                        logger.debug("getTechnology - number CLARITY ERROR. Server was unable to process request." + serviceNumber, "currentTech : " + currentTech);
                        //done();
                    }
                    else {
                        conversation.variable('neType', "NULL NE TYPE");
                        //conversation.transition('blank');
                        transition = 'blank';
                        logger.debug("getTechnology component ,blank argument service number:" + serviceNumber, "currentTech: " + currentTech);
                        logger.debug("getTechnology component ,blank argument service number:" + serviceNumber, "currentTech: " + currentTech);
                        //done();
                    }
                }
            }
            logger.end();
        });
    }
};