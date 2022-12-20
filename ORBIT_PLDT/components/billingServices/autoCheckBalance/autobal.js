"use strict";

const componentName = require('../../../configurations/component_config');
module.exports = {
  metadata: () => ({
    name: componentName.BillingServices.Autobal,
    properties: {
      accountNumber: {
        type: "string",
        required: true
      },
      serviceNumber: {
        type: "string",
        required: true
      }
    },
    supportedActions: ['valid', 'invalid', 'failure', 'fuseDown']
  }),
  invoke: (conversation, done) => {

    // #region Setup Properties  
    const svcNum = conversation.properties().serviceNumber;
    const acctNum = conversation.properties().accountNumber;
    // #endregion

    // #region Imports
    const process = require('../../../businesslogics/billingServices_logic');
    const api = require('../../../http/billingServices_http');
    const globalProp = require('../../../helpers/globalProperties');
    var instance = require("../../../helpers/logger");
    // #endregion

    // #region Initialization
    var _logger = instance.logger(globalProp.Logger.Category.BillingServices.Autobal);
    var logger = _logger.getLogger();

    logger.sendEmail = ((result, resultCode) => {
      process.AutoBalEmailSender(result, resultCode, svcNum, acctNum);
    })

    logger.start = (() => {
      process.AutoBalLoggerStart();
    });

    logger.end = (() => {
      process.AutoBalLoggerEnd(transition);
      _logger.shutdown();
      conversation.transition(transition);
      done();
    });

    let transition = 'fuseDown';

    logger.addContext("serviceNumber", svcNum);
    process.LoggerInstance(logger);
    api.LoggerInstance(logger);

    // #endregion

    logger.start();

    api.AutoBalRequest(svcNum, (error, response) => {
      if (error) {
        logger.sendEmail(error, error.code);
      }
      else {
        logger.info(`Request success with Response Code: [${response.statusCode}]`);

        const result = process.AutoBalProcess(response.statusCode, response.body, acctNum, svcNum)
        transition = result.Transition;

        result.Variables.forEach(element => {
          conversation.variable(element.name, element.value);
        });
      }
      logger.end();
    });
  }
};