const globalProp = require('../helpers/globalProperties');
const emailSender = require('../helpers/emailsender');
const api = require('../http/ticketCreation_http');

let logger;

const CreateFTEmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.TicketCreation.API.Validate.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);

    if (isOn)
        emailSender(globalProp.Email.Subjects.TicketCreation.CreateFT, message, globalProp.Logger.BCPLogging.AppNames.TicketCreation.TicketCreationCreateFt, strResult, resultCode, accountNumber, serviceNumber)
}

const CreateFTLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Ticket Creation - Create FT                                                                       -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const CreateFTLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Ticket Creation - Create FT                                                                         -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const UpdateCreateFT = (accNumberinit, telNumberinit, smpStartTsinit, ticketnumber, reportedBy, responseBody, isOn = true) => {
    if(isOn)
        api.ChatbotUpdateRequest(accNumberinit, telNumberinit, smpStartTsinit, ticketnumber, reportedBy, responseBody)
}

const CreateFTLogic = (statusCode, body, accountNumber, serviceNumber, reportedBy, sysDate, sendEmail = true, dblog = true) => {
    let result = {
        Transition: 'FAILURE',
        Variables: [],
        Reply: []
    }

    const createRes = JSON.parse(body);
    const responseStr = JSON.stringify(createRes).replace('http://', '');

    logger.debug(`[RESPONSE] ${responseStr}`);
    if (statusCode > 200) {
        CreateFTEmailSender(body, statusCode, serviceNumber,accountNumber, sendEmail)
        if (statusCode === 406) {            
            const spiel406 = JSON.stringify(createRes.spiel).replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, '');
            const msg406 = JSON.stringify(createRes.message).replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, '');
            logger.error(`[ERROR 406 SPIEL] ${spiel406}`);
            logger.error(`[ERROR 406 MESSAGE] ${msg406}`);

            if (createRes.spiel) {
                UpdateCreateFT(accountNumber, serviceNumber, sysDate, "ERROR406", reportedBy, responseStr, dblog);
                result.Variables.push({ name: 'spielMsg', value: spiel406 });
            }
            else {
                UpdateCreateFT(accountNumber, serviceNumber, sysDate, "ERROR406", reportedBy, responseStr, dblog);
                result.Variables.push({ name: 'spielMsg', value: msg406 });
            }
        }
        else if (statusCode === 500 || statusCode === 404) {
            UpdateCreateFT(accountNumber, serviceNumber, sysDate, "ERROR500", reportedBy, responseStr, dblog);
            result.Transition = '500';
        }
        else {
            UpdateCreateFT(accountNumber, serviceNumber, sysDate, "FAILURE", reportedBy, responseStr, dblog);
        }
        logger.error(`[ERROR ${statusCode}] ${responseStr}`);
    }
    else {
        var tcktNum = JSON.stringify(createRes.ticketNumber).replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, '');
        var spiel200 = JSON.stringify(createRes.spiel).replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, '');

        logger.debug(`[TICKET NUMBER] ${tcktNum}`);
        logger.debug(`[SUCCESS SPIEL] ${spiel200}`);

        if (tcktNum == null) {
            UpdateCreateFT(accountNumber, serviceNumber, sysDate, statusCode, reportedBy, responseStr, dblog);
        } else {
            var tcktNumData = tcktNum;
            UpdateCreateFT(accountNumber, serviceNumber, sysDate, tcktNumData, reportedBy, responseStr, dblog);
        }

        result.Variables.push({ name: 'spielMsg', value: spiel200 });
        result.Variables.push({ name: 'ticketNumber', value: tcktNum });
        result.Transition = 'SUCCESS';
    }

    return result;
}


module.exports = {
    LoggerInstance: (instance) => { logger = instance },
    CreateFTLoggerStart: CreateFTLoggerStart,
    CreateFTLoggerEnd: CreateFTLoggerEnd,
    CreateFTProcess: CreateFTLogic,
    CreateFTEmailSender: CreateFTEmailSender
}
