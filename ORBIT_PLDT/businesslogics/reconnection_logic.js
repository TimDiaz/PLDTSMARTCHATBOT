const globalProp = require('../helpers/globalProperties');
const emailSender = require('../helpers/emailsender');
const api = require('../http/reconnection_http');

let logger;

const EmailSender = (subject, result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.Reconnection.API.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);

    if (isOn)
        emailSender(subject, message, globalProp.Logger.BCPLogging.AppNames.Reconnection, strResult, resultCode, accountNumber, serviceNumber)
}

const LoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Reconnection                                                                                      -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const LoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Reconnection                                                                                        -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const ResponseLog = (responseType, serviceNumber, accountNumber, responseBody, isOn = true) => {
    api.LogResponse(responseType, serviceNumber, accountNumber, responseBody, isOn)
}

const Logic = (statusCode, body, accountNumber, serviceNumber, sendEmail = true, logResponse = true) => {
    let result = {
        Transition: '406State',
        Variables: [],
        Reply: []
    }

    if (statusCode > 202) {
        EmailSender('[API Error] Reconnection PROD - Cannot Reconnect User', body, statusCode, serviceNumber, accountNumber, sendEmail)
        ResponseLog(statusCode, serviceNumber, accountNumber, JSON.stringify(body), logResponse)
    }
    else {
        var error = {
            error: '',
            statusCode: ''
        }

        var res = JSON.parse(body)['result'];
        var raw = res.includes('|') ? parseInt(res[0]) : parseInt(res);

        logger.info(`[RESULT] ${res}`);
        logger.info(`[RAW] ${raw}`);
        if (raw == 0 || raw == 1) {
            result.Transition = 'acceptedRequest';
            logger.info(`[ACCEPTED REQUEST] ${raw} [ACCOUNT NUMBER] ${accountNumber}`);
        }
        else if (raw == 2) {
            result.Transition = 'ongoingProcess';
            logger.info(`[ONGOING REQUEST] ${raw} [ACCOUNT NUMBER] ${accountNumber}`);
        }
        else if (raw == 4) {
            result.Transition = 'withOpenSO';
            logger.info(`[WITH OPEN SO] ${raw} [ACCOUNT NUMBER] ${accountNumber}`);
        }
        else if (raw == 3) {
            error.error = 'API return 3';
            error.statusCode = '200'
            result.Transition = 'connectCSRMsg';
            logger.info(`[CONNECT CR MESSAGE] ${raw} [ACCOUNT NUMBER] ${accountNumber}`);
            EmailSender('[API Error] Reconnection PROD - API Return 3 (fallout)', error, error.statusCode, serviceNumber, accountNumber, sendEmail)
        }
        else if (raw == 5 || raw == 6 || raw == 7) {
            result.Transition = 'additionalReq';
            logger.info(`[ADDITIONAL REQUEST] ${raw} [ACCOUNT NUMBER] ${accountNumber}`);
        }
        else {
            error.error = 'outside of Recon Matrix';
            error.statusCode = '406'

            result.Transition = '406State';
            logger.info(`[OUTSIDE OF RECONNECTION MATRIX] ${raw}`);
            EmailSender('[API Error] Reconnection PROD - Cannot Reconnect User', error, error.statusCode, serviceNumber, accountNumber, sendEmail)
        }

        ResponseLog(raw, serviceNumber, accountNumber, JSON.stringify(body), logResponse)
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
