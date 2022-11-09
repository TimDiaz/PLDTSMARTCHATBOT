"use strict";
const componentName = require('../../../configurations/component_config');
module.exports = {

    metadata: () => {
        return {
            name: componentName.ValidateEmailFormat,
            properties: {
                email: {
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
            supportedActions: ['validemailformat', 'invalidemailformat', 'failure']
        };
    },
    invoke: (conversation, done) => {
        // #region Setup Properties
        var emaillocal = conversation.properties().email;
        var serviceNumber = conversation.properties().serviceNumber;
        var accountnumberlocal = conversation.properties().accountnumber;
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
            logger.info(`- [START] Validate Email Format                                                                             -`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`);
        });

        logger.end = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Validate Email Format                                                                               -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();
            //conversation.keepTurn(keepTurn);
            conversation.transition(transition);
            done();
        });

        let transition = '';

        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        logger.addContext("serviceNumber", serviceNumber);
        // #endregion

        logger.start();

        if (regex.test(emaillocal)) {
            console.log('valid email', emaillocal);
            transition = 'validemailformat';
            logger.debug('valid email', emaillocal);
        }
        else {
            console.log('invalid', emaillocal);
            transition = 'invalidemailformat';
            logger.debug('invalid email', emaillocal);
        }

        logger.end();
    }
};