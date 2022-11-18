"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.HomeRewards,
        properties: {
            addOnVal: {
                "type": "string",
                "required": true
            },
            serviceNumber: {
                type: "string",
                required: true
            }
        },
        supportedActions: ['homeRewardIncluded','homeRewardExcluded']
    }),

    invoke: (conversation, done) => {
        var addOnVal = conversation.properties().addOnVal;
        var serviceNumber = conversation.properties().serviceNumber;

        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        const _logger = instance.logger(globalProp.Logger.Category.HomeRewards);
        const logger = _logger.getLogger();

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] Home Rewards                                                                                      -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Home Rewards                                                                                        -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();

            conversation.transition(transition);
            done();
        });

        let transition = 'homeRewardExcluded';

        logger.addContext("serviceNumber", serviceNumber);
        logger.start();

        if(addOnVal == "Cordless Landline" || addOnVal === "${addOns.value}"){
            conversation.transition('homeRewardExcluded');
            conversation.variable('home_rewards_result', addOnVal);
            logger.debug(`[ADD-ON VALUE] ${addOnVal}`)
            // do data insert into database here
        }else{
            console.log(" the add on value is: " + addOnVal + " and its qualified for home rewards");
            transition = "homeRewardIncluded";
        }

        logger.end();
    }   
};