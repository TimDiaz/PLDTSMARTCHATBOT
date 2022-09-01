"use strict";

const componentName = require('../../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.ValidateServiceNumberFormat, //"checkservnumberformat",
        properties: {
            serviceNumber: {
                type: "string",
                required: true
            }
        },
        supportedActions: ['validservformat', 'invalidservformat', 'failure']
    }),

    invoke: (conversation, done) => {
        const globalProp = require('../../../helpers/globalProperties');
        const instance = require("../../../helpers/logger");
        const _logger = instance.logger(globalProp.Logger.Category.ValidateServiceNumberFormat);
        const logger = _logger.getLogger();

        let keepTurn = true;
        let transition = "invalidservformat";

        var servNumber = conversation.properties().serviceNumber;
        logger.addContext("serviceNumber", servNumber)

        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        logger.info(`- [START] Validate Service Number Format                                                                    -`)
        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        logger.info(`Service Number: [${servNumber}]`);

        var resChkStr = servNumber.match(globalProp.ValidateServiceNumberFormat.Regex.ServiceNumberFormat);
        if (resChkStr === null) {
            logger.info(`[Valid] Service Number is numeric`);
            if (servNumber.length == 10) {
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
        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        logger.info(`- [END] Validate Service Number Format                                                                      -`)
        logger.info(`-------------------------------------------------------------------------------------------------------------`)

        _logger.shutdown();
        conversation.keepTurn(keepTurn);
        conversation.transition(transition);
        done();
    }
};