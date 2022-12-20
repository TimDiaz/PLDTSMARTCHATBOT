const globalProp = require('../helpers/globalProperties');
const emailSender = require('../helpers/emailsender');

let logger;

const EmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.AccountValidation.API.Validate.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);

    if (isOn)
        emailSender(globalProp.Email.Subjects.AccountValidation, message, globalProp.Logger.BCPLogging.AppNames.AccountValidation, strResult, resultCode, accountNumber, serviceNumber);
}

const LoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Account Validation                                                                                -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const LoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Account Validation                                                                                  -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const Logic = (statusCode, body, accountNumber, serviceNumber, sendEmail = true) => {
    let result = {
        Transition: 'failure',
        Variables: [],
        Reply: []
    }

    const strResponseBody = JSON.stringify(body);

    if (statusCode > 200) {
        EmailSender(body, statusCode, serviceNumber, accountNumber, sendEmail);
        switch (statusCode) {
            case 400:
                logger.error(`[ERROR CODE: ${statusCode}] ${strResponseBody}`)
                result.Transition = 'invalidAcct';
                break;
            case 408:
                logger.error(`[ERROR CODE: ${statusCode}] Invalid Account Number or Telephone Number, Please try a different account.`);
                break;
            case 502:
                logger.error(`[ERROR CODE: ${statusCode}] Bad Gateway Error, Please try again later.`);
                break;
            case 504:
                logger.error(`[ERROR CODE: ${statusCode}] Internal Server Error Ecountered, Please try a different account.`);
                break;
            case 500:
                logger.error(`[ERROR CODE: ${statusCode}] Internal Server Error Ecountered, Please try a different account.`);
                break;
            case 599:
                result.Reply.push({ text: `${statusCode} Network Connect Timeout Error, Please try again later.` });
                logger.error(`[ERROR CODE: ${statusCode}] Network Connect Timeout Error, Please try again later.`);
                break;
            default:
                result.Variables.push({ name: 'invalidacctmsg', value: JSON.parse(body).message });
                logger.error(`[ERROR CODE: ${statusCode}] ${JSON.parse(body).message}`);
                break;
        }
    }
    else {
        const responseBody = JSON.parse(body);
        logger.debug(`Response Body:  ${JSON.stringify(responseBody)}`);
        logger.info(`Account is ${responseBody.isValid ? 'valid' : 'invalid'}.`)
        if (responseBody.isValid === true) {
            result.Variables.push({ name: 'validacctmsg', value: responseBody.message });
            result.Variables.push({ name: 'withExtension', value: responseBody.extension });
            if (responseBody.callType === null) {
                logger.warn(`Call Type: [No Call Type]`);
                result.Variables.push({ name: 'callType', value: 'No call type' });
                result.Transition = 'validAcct';
            }
            else {
                logger.info(`Call Type: [${responseBody.callType}]`);
                result.Variables.push({ name: 'callType', value: responseBody.callType });
                result.Transition = 'validAcct';
            }
        }
        else {
            result.Variables.push({ name: 'invalidacctmsg', value: responseBody.message });
            result.Transition = 'invalidAcct';
        }
    }

    return result;
}


module.exports = {
    LoggerInstance: (instance) => { logger = instance },
    LoggerStart: LoggerStart,
    LoggerEnd: LoggerEnd,
    Process: Logic,
    EmailSender: EmailSender
}
