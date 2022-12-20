"use strict";

const componentName = require('../../../configurations/component_config');
module.exports = {
  metadata: () => ({
    name: componentName.BillingServices.Autoesoa,
    properties: {
      serviceNumber: {
        type: "string",
        required: true
      },
      monthBill: {
        type: "string",
        required: true
      }
    },
    supportedActions: ['success', 'invalid', 'failed', 'invalidparam', 'invalidBillingDate', 'InvalidEmail']
  }),
  invoke: (conversation, done) => {
    // #region Setup Properties  
    var svcNum = conversation.properties().serviceNumber;
    var month = conversation.properties().monthBill;
    // #endregion

    // #region Imports
    const process = require('../../../businesslogics/billingServices_logic');
    const api = require('../../../http/billingServices_http');
    const globalProp = require('../../../helpers/globalProperties');
    const instance = require("../../../helpers/logger");
    // #endregion

    // #region Initialization
    const _logger = instance.logger(globalProp.Logger.Category.BillingServices.Autoesoa);
    const logger = _logger.getLogger();

    logger.sendEmail = ((result, resultCode) => {
      process.AutoESoaEmailSender(result, resultCode, svcNum, 'NO DATA');
    })

    logger.start = (() => {
      process.AutoESoaLoggerStart();
    });

    logger.end = (() => {
      process.AutoESoaLoggerEnd(transition);
      _logger.shutdown();
      conversation.transition(transition);
      done();
    });

    let transition = '';

    logger.addContext("serviceNumber", svcNum);
    process.LoggerInstance(logger);
    api.LoggerInstance(logger);
    // #endregion

    logger.start();

    api.AutoESoaRequest(svcNum, month, (error, response) => {
      if (error) {
        logger.sendEmail(error, error.code);
      }
      else {
        logger.info(`Request success with Response Code: [${response.statusCode}]`);

        const result = process.AutoESoaProcess(response.statusCode, response.body, 'NO DATA', svcNum)
        transition = result.Transition;
      }
      logger.end();
    });
  }
};