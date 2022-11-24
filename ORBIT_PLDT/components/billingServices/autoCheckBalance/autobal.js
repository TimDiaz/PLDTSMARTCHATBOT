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
    const request = require('request');
    const moment = require('moment');
    const globalProp = require('../../../helpers/globalProperties');
    const emailSender = require('../../../helpers/emailsender');
    var instance = require("../../../helpers/logger");
    // #endregion

    // #region Initialization
    var _logger = instance.logger(globalProp.Logger.Category.BillingServices.Autobal);
    var logger = _logger.getLogger();

    logger.sendEmail = ((result, resultCode) => {
      const strResult = JSON.stringify(result);
      const message = globalProp.Email.EmailFormat(globalProp.BillingServices.Autobal.API.CheckBalance.Name, resultCode, strResult, svcNum);
      logger.error(`[ERROR]: ${strResult}`);
      emailSender(globalProp.Email.Subjects.BillingServices.Autobal, message, globalProp.Logger.BCPLogging.AppNames.BillingServices.Autobal, strResult, resultCode, acctNum, svcNum)
    })

    logger.start = (() => {
      logger.info(`-------------------------------------------------------------------------------------------------------------`);
      logger.info(`- [START] Check Auto Balance                                                                                -`);
      logger.info(`-------------------------------------------------------------------------------------------------------------`);
    });

    logger.end = (() => {
      logger.info(`[Transition]: ${transition}`);
      logger.info(`-------------------------------------------------------------------------------------------------------------`);
      logger.info(`- [END] Auto Check Balance                                                                                  -`);
      logger.info(`-------------------------------------------------------------------------------------------------------------`);

      _logger.shutdown();

      conversation.transition(transition);
      done();
    });

    function HasInvalidServiceStatus(responseBody, servicestatus) {
      return (responseBody.serviceProfiles.find(e => e.serviceStatus === servicestatus) !== undefined)
    }

    let transition = '';

    logger.addContext("serviceNumber", svcNum);
    // #endregion

    logger.start();

    var options = globalProp.BillingServices.Autobal.API.CheckBalance.GetOptions(svcNum);
    logger.debug(`Setting up the post option for API Token: ${JSON.stringify(options)}`);
    logger.info(`Starting to invoke the request for API Token.`);
    request(options, function (error, response) {
      if (error) {
        transition = 'fuseDown';
        logger.sendEmail(error, error.code);
        logger.end();
      }
      else {
        var responseBody;
        if (typeof (response.body) === "string")
          responseBody = JSON.parse(response.body);
        else
          responseBody = response.body;

        logger.info("parsed mobility body :", response.body);
        logger.info("Mobility Error: ", error);
        if (response.statusCode > 200) {
          if (responseBody.errorMessage != "2") {
            transition = 'fuseDown';
            logger.sendEmail(responseBody, response.statusCode);
            logger.end();
          }
        }
        else {
          try {
            logger.info("[Fuse Service] Get Account Balanace Body: ", responseBody);

            if (responseBody.errorMessage === null) {
              var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

              var parsedCurrentBalance = responseBody.balanceProfile.currentBalance;
              if(parsedCurrentBalance === null || parsedCurrentBalance === undefined)
                throw 'Invalid Current Balance';

              var floatCurrentBalance = parseFloat(parsedCurrentBalance);
              conversation.variable('currentBalance', floatCurrentBalance.toFixed(2));

              var parsedDueDate = responseBody.customerProfile[0].balanceDueDate;
              var dueDateFormatted = new Date(parsedDueDate);
              if (dueDateFormatted == 'Invalid Date') 
                throw "Invalid Date";
              
              var dueDateMonth = months[dueDateFormatted.getMonth()];
              var dueDateDay = dueDateFormatted.getDate();
              var dueDateYear = dueDateFormatted.getFullYear();
              conversation.variable('DueDates', dueDateMonth + " " + dueDateDay + ", " + dueDateYear);
              logger.debug("[DUE DATES]: " + dueDateMonth + " " + dueDateDay + ", " + dueDateYear);

              var formattedEmail = "null";
              var emailAdd = responseBody.customerProfile[0].emailAddress;
              if (emailAdd != null  && emailAdd !== "NONE") {
                var firstLet = emailAdd.substr(0, 1);
                var atPos = emailAdd.search("@");
                var toMask = emailAdd.substr(1, atPos - 1);
                var maskLength = toMask.length;
                var afterAt = emailAdd.substr(atPos);
                var mask = "*";
                var formattedEmail = firstLet + mask.repeat(maskLength) + afterAt;
              }
              conversation.variable('balEmailAdd', formattedEmail);
              logger.debug("[EMAIL ADDRESS]: " + formattedEmail);


              if (HasInvalidServiceStatus(responseBody,'Suspended')) {
                conversation.variable('serviceStatus', 'Suspended');
                transition = 'failure';

              }
              else if (HasInvalidServiceStatus(responseBody,'Barred')) {
                conversation.variable('serviceStatus', 'Barred');
                transition = 'failure';
              }
              else {
                conversation.variable('serviceStatus', 'passed');
                transition = 'valid';
              }
              logger.end();
            }
            else{
              throw responseBody.errorMessage;
            }
          }
          catch (e) {
            transition = 'fuseDown';
            logger.sendEmail(response.body, response.statusCode);
            logger.end();
          }
        }
      }
    });
  }
};