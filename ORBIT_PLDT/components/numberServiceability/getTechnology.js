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
        const process = require('../../businesslogics/numberServiceability_logic');
        const api = require('../../http/numberServiceability_http');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.NumberServiceability.NumberServiceabilityTechnology);
        const logger = _logger.getLogger();

        logger.addContext("serviceNumber", serviceNumber)
        process.LoggerInstance(logger);
        api.LoggerInstance(logger);

        logger.sendEmail = ((result, resultCode) => {
            process.TechEmailSender(result, resultCode, serviceNumber, accountNumber);
        })

        logger.start = (() => {
            process.TechLoggerStart();
        });

        logger.end = (() => {
            process.TechLoggerEnd(transition);
            _logger.shutdown();
            conversation.transition(transition);
            done();
        });


        let transition = 'failure';
        let areacode = "";
        let telephone = "";
        let accountNumber = "NO DATA";
        // #endregion

        logger.start();

        logger.debug("info from bot:" + serviceNumber)

        if (serviceNumber.length == 9) {
            areacode = serviceNumber.substring(2, 0);
            telephone = serviceNumber.substring(2);
        }
        else {
            if (serviceNumber.substring(3, 0) == '028') {
                areacode = serviceNumber.substring(2, 0);
                telephone = serviceNumber.substring(2);
            }
            else if (serviceNumber.substring(3, 0) == '034') { // start here  ---> capture 034
                areacode = serviceNumber.substring(3, 0);
                telephone = serviceNumber.substring(3);
            }
            else {
                areacode = serviceNumber.substring(3, 0);
                telephone = serviceNumber.substring(3);
            }
        }
        logger.debug(`Area Code: [${areacode}].`)
        logger.debug(`Telephone: [${telephone}].`)

        api.PostRequest(areacode, telephone, (error, response) => {
            if (error) {
                logger.sendEmail(error, error.code);
            }
            else {
                const result = process.TechProcess(response.statusCode, response.body, accountNumber, serviceNumber)
                transition = result.Transition;

                result.Variables.forEach(element => {
                    conversation.variable(element.name, element.value);
                });
            }
            logger.end();
        });
    }
};