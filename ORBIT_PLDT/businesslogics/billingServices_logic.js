const globalProp = require('../helpers/globalProperties');
const emailSender = require('../helpers/emailsender');

let logger;

const AutoBalEmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.BillingServices.Autobal.API.CheckBalance.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);      

    if (isOn)
        emailSender(globalProp.Email.Subjects.BillingServices.Autobal, message, globalProp.Logger.BCPLogging.AppNames.BillingServices.Autobal, strResult, resultCode, accountNumber, serviceNumber);
}

const AutoESoaEmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.BillingServices.Autoesoa.API.GetEsoaBalance.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);      

    if (isOn)
        emailSender(globalProp.Email.Subjects.BillingServices.Autoesoa, message, globalProp.Logger.BCPLogging.AppNames.BillingServices.Autoesoa, strResult, resultCode, accountNumber, serviceNumber);
}

const AutoBalLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Auto Check Balance                                                                                -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}
const AutoBalLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Auto Check Balance                                                                                  -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const AutoESoaLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Auto Check Auto ESOA                                                                              -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}
const AutoESoaLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Auto Check Auto ESOA                                                                                -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const hasInvalidServiceStatus = (body, servicestatus) => {
    return (body.serviceProfiles.find(e => e.serviceStatus === servicestatus) !== undefined)
}

const maskEmail = (emailAdd) => {
  if (emailAdd != null  && emailAdd !== "NONE") {
    const firstLet = emailAdd.substr(0, 1);
    const atPos = emailAdd.search("@");
    const toMask = emailAdd.substr(1, atPos - 1);
    const maskLength = toMask.length;
    const afterAt = emailAdd.substr(atPos);
    const mask = "*";
    return firstLet + mask.repeat(maskLength) + afterAt;
  }
  else
    return "null"
}

const longDateFormat = (date) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateMonth = months[date.getMonth()];
  const dateDay = date.getDate();
  const dateYear = date.getFullYear();
  return `${dateMonth} ${dateDay}, ${dateYear}`;
}

const AutoBalLogic = (statusCode, body, accountNumber, serviceNumber, sendEmail) => {
    let result = {
        Transition: 'fuseDown',
        Variables: [],
        Reply: []
    }

    if (statusCode > 200) {
      AutoBalEmailSender(body, statusCode, serviceNumber, accountNumber, sendEmail);
    }
    else {
      try {
        logger.info(`[RESPONSE BODY] ${body}`);        

        const responseBody = JSON.parse(body);

        if (responseBody.errorMessage === null) {
          

          var parsedCurrentBalance = responseBody.balanceProfile.currentBalance;
          if(parsedCurrentBalance === null || parsedCurrentBalance === undefined)
            throw 'Invalid Current Balance';

          var floatCurrentBalance = parseFloat(parsedCurrentBalance);
          result.Variables.push({ name: 'currentBalance', value: floatCurrentBalance.toFixed(2) });

          var parsedDueDate = responseBody.customerProfile[0].balanceDueDate;
          if(parsedDueDate === null) parsedDueDate = undefined;
          var dueDateFormatted = new Date(parsedDueDate);
          if (dueDateFormatted == 'Invalid Date') 
            throw "Invalid Date";
          
          const dueDate = longDateFormat(dueDateFormatted);
          result.Variables.push({ name: 'DueDates', value: dueDate });
          logger.debug("[DUE DATES]: " + dueDate);

          
          var emailAdd = responseBody.customerProfile[0].emailAddress;
          var formattedEmail = maskEmail(emailAdd);
          result.Variables.push({ name: 'balEmailAdd', value: formattedEmail });
          logger.debug("[EMAIL ADDRESS]: " + formattedEmail);


          if (hasInvalidServiceStatus(responseBody,'Suspended')) {
            result.Variables.push({ name: 'serviceStatus', value: 'Suspended' });
            result.Transition = 'failure';
          }
          else if (hasInvalidServiceStatus(responseBody,'Barred')) {
            result.Variables.push({ name: 'serviceStatus', value: 'Barred' });
            result.Transition = 'failure';
          }
          else {
            result.Variables.push({ name: 'serviceStatus', value: 'passed' });
            result.Transition = 'valid';
          }
        }
        else{
          if (responseBody.errorMessage != "2") {
            AutoBalEmailSender(body, statusCode, serviceNumber, accountNumber, sendEmail);
          }
          throw responseBody.errorMessage;
        }
      }
      catch (e) {
        result.Transition = 'fuseDown';
        AutoBalEmailSender(body, statusCode, serviceNumber, accountNumber, sendEmail);
      }
    }

    return result;
}

const AutoESoaLogic = (statusCode, body, accountNumber, serviceNumber, sendEmail = true) => {
    let result = {
        Transition: 'failed',
        Variables: [],
        Reply: []
    }

    logger.info(`[RESPONSE BODY] ${body}`);
    if (statusCode == 200) {
        result.Transition  = 'success';
    } //auto bal get email end
    else {
        if (statusCode == 402) {
            result.Transition = 'invalidparam';
        }
        else if (statusCode == 403) {
            result.Transition = 'InvalidEmail';
        }
        else if (statusCode == 404) {
            result.Transition = 'invalidBillingDate';
        }
        else {
            result.Transition = 'failed'; //400, 500 return
        }
        AutoESoaEmailSender(body, statusCode, serviceNumber, accountNumber, sendEmail);
    }
    return result;
}


module.exports = {
    LoggerInstance: (instance) => { logger = instance },
    AutoBalLoggerStart: AutoBalLoggerStart,
    AutoBalLoggerEnd: AutoBalLoggerEnd,
    AutoESoaLoggerStart: AutoESoaLoggerStart,
    AutoESoaLoggerEnd: AutoESoaLoggerEnd,
    AutoBalProcess: AutoBalLogic,
    AutoESoaProcess: AutoESoaLogic,
    AutoBalEmailSender: AutoBalEmailSender,
    AutoESoaEmailSender: AutoESoaEmailSender,
    MaskEmail: maskEmail,
    LongDateFormat: longDateFormat
}
