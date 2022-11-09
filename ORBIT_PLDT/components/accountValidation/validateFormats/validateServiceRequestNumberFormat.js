"use strict";

const componentName = require('../../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.ValidateServiceRequestNumberFormat, //"checkserviceRequestNumberformat",
        properties: {
            serviceNumber: {
                type: "string",
                required: true
            },
            serviceRequestNumber: {
                type: "string",
                required: false
            }
        },
        supportedActions: ['validservformat', 'invalidservformat', 'failure']
    }),

    invoke: (conversation, done) => {
        // #region Setup Properties
        var serviceNumber = conversation.properties().serviceNumber;
        var serviceRequestNumber = conversation.properties().serviceRequestNumber;
        // #endregion

        // #region Imports
        const globalProp = require('../../../helpers/globalProperties');
        const instance = require("../../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.ValidateServiceNumberFormat);
        const logger = _logger.getLogger();

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] Validate Service Request Number Format                                                            -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Validate Service Request Number Format                                                                      -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();
            conversation.keepTurn(keepTurn);
            conversation.transition(transition);
            done();
        });

        let keepTurn = true;
        let transition = "invalidservformat";
        
        logger.addContext("serviceNumber", serviceNumber)
        // #endregion

        logger.start();
        logger.info(`Service Number: [${serviceRequestNumber}]`);

        var resChkStr = serviceRequestNumber.match(globalProp.ValidateServiceNumberFormat.Regex.ServiceNumberFormat);
        if (resChkStr === null) {
            logger.info(`[Valid] Service Number is numeric`);
            if (serviceRequestNumber.length == 10) {
                logger.info(`[Valid] Service Number lenght is 10.`);
                transition = 'validservformat';
            }
            else {
                logger.warn(`[Invalid] Service Number is lessthan or greaterthan 10.`);
                transition = 'invalidservformat';
            }
        }
        else if (resChkStr.length > 0) {
            logger.info(`[Invalid] Service Number is alphanumeric`);
            transition = 'invalidservformat';
        }
        logger.end();
    }
};