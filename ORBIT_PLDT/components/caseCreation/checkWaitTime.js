"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {

    metadata: () => ({
        name: componentName.CheckWaitTime,
        properties: {
            serviceNumber: {
                type: "string",
                required: true
            },
            deploymentid: {
                type: "string",
            },
            buttonid: {
                type: "string",
            },
        },
        supportedActions: ['agentAvail', 'directToAgent', 'directToCase', 'failure']
    }),
    invoke: (conversation, done) => 
    {
        // #region Setup Properties
        const accountNumber = "NO DATA";
        const serviceNumber = conversation.properties().serviceNumber;
        const deploymentid = conversation.properties().deploymentid;
        const buttonid = conversation.properties().buttonid;
        // const orgId = "00D7F000000zntY";
        // #endregion

        // #region Imports
        const process = require('../../businesslogics/caseCreation_logic');
        const api = require('../../http/caseCreation_http');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.CaseCreation.CheckWaitTime);
        const logger = _logger.getLogger();

        logger.addContext("serviceNumber", serviceNumber);
        process.LoggerInstance(logger);
        api.LoggerInstance(logger);
        
        logger.sendEmail = ((result, resultCode) => {
            process.CheckWaitTimeEmailSender(result, resultCode, serviceNumber, accountNumber);
        }) 

        logger.start = (() => {
            process.CheckWaitTimeLoggerStart()
        });

        logger.end = (() => {
            process.CheckWaitTimeLoggerEnd(transition);
            _logger.shutdown();
            conversation.transition(transition);
            done();
        });

        let transition = 'failure';        
        // #endregion

        logger.start();
        
        api.CheckWaitTimeRequest(deploymentid, buttonid, (error, response) => {
            if (error) {
                conversation.variable('waitTime', "undefined");
                conversation.variable('waitTimeSec', 0);
                conversation.variable('LiveAgent_queue', process.GetQueueName(deploymentid, buttonid));
                logger.sendEmail(error, error.code);
            }
            else {
                logger.info(`Request success with Response Code: [${response.statusCode}]`);

                const result = process.CheckWaitTimeLogic(response.statusCode, response.body, accountNumber, serviceNumber, deploymentid, buttonid)
                transition = result.Transition;

                result.Variables.forEach(element => {
                    conversation.variable(element.name, element.value);
                });
            }      
            logger.end();      
        });
    }
};
