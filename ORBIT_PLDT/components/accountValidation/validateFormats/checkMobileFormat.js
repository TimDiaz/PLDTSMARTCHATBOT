"use strict";

const componentName = require('../../../configurations/component_config');
module.exports = {

    metadata: () => {
        return {
            name: componentName.ValidateMobileFormat,
            properties: {
                mobile: {
                    type: "string",
                    required: true
                },
                accountNumber: {
                    type: "string",
                    required: false
                },
                serviceNumber: {
                    type: "string",
                    required: false
                }
            },
            supportedActions: ['validmobileformat', 'invalidmobileformat', 'failure']
        };
    },

    invoke: (conversation, done) => {
        // #region Setup Properties
        var mobile = conversation.properties().mobile;
        var accountnumber = conversation.properties().accountnumber;
        var serviceNumber = conversation.properties().serviceNumber;
        // #endregion

        // #region Imports
        const globalProp = require('../../../helpers/globalProperties');
        const instance = require("../../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.ValidateEmailFormat);
        const logger = _logger.getLogger();

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`);
            logger.info(`- [START] Validate Mobile Format                                                                            -`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`);
        });

        logger.end = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Validate Mobile Format                                                                              -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();
            conversation.transition(transition);
            done();
        });

        let transition = '';

        var regex = /^[0-9]{1,11}(,[0-9]{0,2})?$/;

        logger.addContext("serviceNumber", serviceNumber);
        // #endregion          

        logger.start();

        logger.debug(conversation.properties().mobile);
        logger.debug("mobile and account number: " + mobile + accountnumber);

        function validateMobile(mobile) {
            if (!regex.test(mobile)) {
                return false;
            }
            else {
                return true;
            }
        }

        if (!validateMobile(mobile)) {
            transition = 'invalidmobileformat';
            logger.debug('invalid mobile', mobile);
        }
        else {
            if (mobile.length == 11) {
                transition = 'validmobileformat';
                logger.debug('valid mobile', mobile);
            }
            else {
                transition = 'invalidmobileformat';
                logger.debug('invalid mobile', mobile);
            }
        }
        logger.end();
    }
};