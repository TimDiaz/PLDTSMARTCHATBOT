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
    const request = require('request');
    const globalProp = require('../../../helpers/globalProperties');
    const emailSender = require('../../../helpers/emailsender');
    const instance = require("../../../helpers/logger");
    // #endregion

    // #region Initialization
    const _logger = instance.logger(globalProp.Logger.Category.BillingServices.Autoesoa);
    const logger = _logger.getLogger();

    logger.sendEmail = ((result, resultCode) => {
      const strResult = JSON.stringify(result);
      const message = globalProp.Email.EmailFormat(globalProp.BillingServices.Autobal.API.CheckBalance.Name, resultCode, strResult, svcNum);
      logger.error(`[ERROR]: ${strResult}`);
      emailSender(globalProp.Email.Subjects.BillingServices.Autoesoa, message, globalProp.Logger.BCPLogging.AppNames.BillingServices.Autoesoa, strResult, resultCode, 'NO DATA', svcNum)
    })

    logger.start = (() => {
      logger.info(`-------------------------------------------------------------------------------------------------------------`);
      logger.info(`- [START] Check Auto ESOA                                                                                   -`);
      logger.info(`-------------------------------------------------------------------------------------------------------------`);
    });

    logger.end = (() => {
      logger.info(`[Transition]: ${transition}`);
      logger.info(`-------------------------------------------------------------------------------------------------------------`);
      logger.info(`- [END] Check Auto ESOA                                                                                       -`);
      logger.info(`-------------------------------------------------------------------------------------------------------------`);

      _logger.shutdown();

      conversation.transition(transition);
      done();
    });

    let transition = '';

    logger.addContext("serviceNumber", svcNum);
    // #endregion

    logger.start();

    if (month == 'Current Month') {
      //var a = new Date();
      var numMon = 1;
    }
    else if (month == 'Last 3 Months') {
      //var b = new Date();
      var numMon = 3;
    }

    var options = globalProp.BillingServices.Autoesoa.API.GetEsoaBalance.GetOptions(svcNum, numMon);
    logger.debug(`Setting up the post option for API Token: ${JSON.stringify(options)}`);

    request(options, function (error, response) {
      if (error) { 
        logger.sendEmail(error, error.code);
        transition = 'failed';
      }
      else {
        logger.info(response);
        if (response.statusCode == 200) {
          transition = 'success';
        } //auto bal get email end
        else {
          if (response.statusCode == 400) {
            transition = 'failed';
          }
          else if (response.statusCode == 402) {
            transition = 'invalidparam';
          }
          else if (response.statusCode == 403) {
            transition = 'InvalidEmail';
          }
          else if (response.statusCode == 404) {
            transition = 'invalidBillingDate';
          }
          else {
            transition = 'failed'; //500 return
          }
          logger.sendEmail(response.body, response.statusCode)
        }
      }
      logger.end();
    })
  }
};