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

const CreationEmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.TicketCreation.API.Validate.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);

    if (isOn)
        emailSender(globalProp.Email.Subjects.TicketCreation.TicketCreation, message, globalProp.Logger.BCPLogging.AppNames.TicketCreation.TicketCreation, strResult, resultCode, accountNumber, serviceNumber)
}

const PromEmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.TicketCreation.API.Validate.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);

    if (isOn)
        emailSender(globalProp.Email.Subjects.TicketCreation.TicketProm, message, globalProp.Logger.BCPLogging.AppNames.TicketCreation.TicketProm, strResult, resultCode, accountNumber, serviceNumber)
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

const CreationLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Ticket Creation                                                                                   -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const CreationLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Ticket Creation                                                                                     -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const PromLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Ticket Creation - PROM                                                                            -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const PromLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Ticket Creation - PROM                                                                              -`)
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
            const spiel406 = createRes.spiel != null? createRes.spiel.replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, ''): null;
            const msg406 = createRes.message != null? createRes.message.replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, ''): null;
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
        var tcktNum = createRes.ticketNumber != null? createRes.ticketNumber.replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, ''): null;
        var spiel200 = createRes.spiel != null? createRes.spiel.replace(/[&\/\\#,+()$~%.'":*?<>{}]+/g, ''): null;

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

const CreationLogic = (statusCode, body, accountNumber, serviceNumber, sendEmail = true) => {
    let result = {
        Transition: 'FAILURE',
        Variables: [],
        Reply: []
    }

    const JSONRes = JSON.parse(body);
    if (statusCode > 200) {
        switch(statusCode){
            case 406:
                logger.error(`[ERROR 406 SPIEL] ${JSONRes.spiel}`);
                logger.error(`[ERROR 406 MESSAGE] ${JSONRes.message}`);
    
                if (JSONRes.spiel) {
                    result.Variables.push({ name: 'spielMsg', value: JSONRes.spiel });
                }else {
                    result.Variables.push({ name: 'spielMsg', value: JSONRes.message });
                }
                break;
            case 500:
                result.Transition = '500';
                break;
            default:
                result.Transition = 'FAILURE';
                break
        }
        CreationEmailSender(body, statusCode, serviceNumber,accountNumber, sendEmail)
    }
    else {
        logger.debug(`[TICKET NUMBER] ${JSONRes.ticketNumber}`);
        logger.debug(`[SUCCESS SPIEL] ${JSONRes.spiel}`);

        result.Variables.push({ name: 'spielMsg', value: JSONRes.spiel });
        result.Variables.push({ name: 'ticketNumber', value: JSONRes.ticketNumber });

        result.Transition = 'SUCCESS';
    }

    return result;
}

const PromLogic = (statusCode, body, accountNumber, serviceNumber, sendEmail = true) => {
    let result = {
        Transition: 'FAILURE',
        Variables: [],
        Reply: []
    }

    var JSONRes = JSON.parse(body);

    if (statusCode > 200) {
        switch(statusCode){
            case 406:
                logger.error(`[ERROR 406 SPIEL] ${JSONRes.spiel}`);
                logger.error(`[ERROR 406 MESSAGE] ${JSONRes.message}`);
    
                if (JSONRes.spiel) {
                    result.Variables.push({ name: 'spielMsg', value: JSONRes.spiel });
                }else {
                    result.Variables.push({ name: 'spielMsg', value: JSONRes.message });
                }
                break;
            case 500:
                result.Transition = '500';
                break;
            default:
                result.Transition = 'FAILURE';
                break
        }
        PromEmailSender(body, statusCode, serviceNumber,accountNumber, sendEmail)
    }
    else {
        logger.debug(`[TICKET NUMBER] ${JSONRes.ticketNumber}`);
        logger.debug(`[SUCCESS SPIEL] ${JSONRes.spiel}`);

        result.Variables.push({ name: 'spielMsg', value: JSONRes.spiel });
        result.Variables.push({ name: 'ticketNumber', value: JSONRes.ticketNumber });

        result.Transition = 'SUCCESS';
    }

    return result;
}


module.exports = {
    LoggerInstance: (instance) => { logger = instance },
    CreateFTLoggerStart: CreateFTLoggerStart,
    CreateFTLoggerEnd: CreateFTLoggerEnd,
    CreateFTProcess: CreateFTLogic,
    CreateFTEmailSender: CreateFTEmailSender,
    CreationLoggerStart: CreationLoggerStart,
    CreationLoggerEnd: CreationLoggerEnd,
    CreationProcess: CreationLogic,
    CreationEmailSender: CreationEmailSender,
    PromLoggerStart: PromLoggerStart,
    PromLoggerEnd: PromLoggerEnd,
    PromProcess: PromLogic,
    PromEmailSender: PromEmailSender
}
