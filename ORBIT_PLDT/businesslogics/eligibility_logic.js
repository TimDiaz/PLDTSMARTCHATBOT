const globalProp = require('../helpers/globalProperties');
const emailSender = require('../helpers/emailsender');

let logger;

const EmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.AccountEligibility.API.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);
    if (isOn)
        emailSender(globalProp.Email.Subjects.AccountEligibility, message, globalProp.Logger.BCPLogging.AppNames.AccountEligibility, strResult, resultCode, accountNumber, serviceNumber)
}

const LoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Account Eligibility                                                                               -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const LoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Account Eligibility                                                                                 -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const ErrorResponse = code => {
    let errormsg = '';
    switch (code) {
        case 500:
            errormsg = `[ERROR CODE: ${code}] Internal Server Error Ecountered, Please try a different account.`;
            break;
        case 408:
            errormsg = `[ERROR CODE: ${code}] Request Time out, Please try again later.`;
            break;
        case 502:
            errormsg = `[ERROR CODE: ${code}] Bad Gateway Error, Please try again later.`;
            break;
        case 599:
            errormsg = `[ERROR CODE: ${code}] Network Connect Timeout Error, Please try again later.`;
            break;
        default:
            errormsg = `[ERROR CODE: ${code}] OOPS, Error Happened! Contact Administrator.`;
            break;
    }
    return { Message: errormsg };
}

const Logic = (statusCode, body, accountNumber, serviceNumber, sendEmail = true) => {
    let result = {
        Transition: '',
        Variables: [],
        KeepTurn: false
    }
    const JSONRes = JSON.parse(body);

    logger.info(`[Response Body] ${body}`);
    if (statusCode > 200) {
        EmailSender(body, statusCode, serviceNumber, accountNumber, sendEmail);
        result.Transition = 'failure';
        logger.error(ErrorResponse(statusCode).Message);
    }
    else {
        if (JSONRes.eligible === false) {
            const message = JSONRes.message.toString();
            const spiel = JSONRes.spiel ? JSONRes.spiel.toString() : '';

            result = Process(message, spiel);
        }
        else {
            result.Transition = 'eligible';
            result.KeepTurn = true;
        }
    }

    return result;
}

const Process = (message, spiel) => {
    let result = {
        Transition: '',
        Variables: [],
        KeepTurn: false
    }
    const types = globalProp.AccountEligibility.Types;

    switch (message) {
        case types.UnderTreatment.Message:
            logger.debug(`[Response Message]: ${types.UnderTreatment.Message}`);
            logger.debug(`[Spiel]: ${spiel}`);

            result.Variables.push({ name: types.UnderTreatment.Conversation.Variables[0], value: spiel });
            result.Transition = types.UnderTreatment.Conversation.Transition;
            break;
        case types.AccountIsNotRBG.Message:
            logger.debug(`[Response Message]: ${types.AccountIsNotRBG.Message}`);
            logger.debug(`[Spiel]: ${spiel}`);

            result.Variables.push({ name: types.AccountIsNotRBG.Conversation.Variables[0], value: spiel });
            result.Transition = types.AccountIsNotRBG.Conversation.Transition;
            break;
        case types.WithOpenRepairTicket.Message:
            logger.debug(`[Response Message]: ${types.WithOpenRepairTicket.Message}`);
            logger.debug(`[Spiel]: ${spiel}`);

            var tickmatch = spiel.match(globalProp.AccountEligibility.Validation.DigitsOnly);
            var ticketNum = tickmatch[0];
            var ticketTier = spiel.match(globalProp.AccountEligibility.Validation.Tier);
            var ticketType = spiel.match(globalProp.AccountEligibility.Validation.Types);

            logger.debug(`value of ticket tier:  [${ticketTier}].`);
            logger.debug(`value of ticket type:  [${ticketType}].`);
            logger.debug(`value of ticket number:  [${ticketNum}].`);

            const tier = types.WithOpenRepairTicket.Tier;
            result.Variables.push({ name: tier.Conversation.Variables[0], value: ticketNum });

            const sTicketTier = ticketTier === null ? 'default' : ticketTier[0];
            switch (sTicketTier) {
                case tier.Parent.Name:
                    const parent = tier.Parent.TicketTypes;
                    result.Variables.push({ name: parent.Conversation.Variables[0], value: ticketType.toString() });
                    if (ticketType == parent.VC.Name) {
                        result.Transition = parent.VC.Conversation.Transition;
                    } else if (ticketType.includes(parent.CR.Name)) {
                        result.Transition = parent.CR.Conversation.Transition;
                    } else {
                        result.Transition = parent.Default.Conversation.Transition;
                    }
                    break;
                case tier.Child.Name:
                    result.Transition = tier.Child.TicketTypes.Conversation.Transition;
                    break;
                default:
                    const def = tier.Default;
                    // result.Variables.push({ name: def.Conversation.Variables[0], value: def.Types.Testing.PromWordSpiel });
                    if (spiel.match(def.Types.InitialDiagnosis.Validation)) {
                        result.Variables.push({ name: def.Conversation.Variables[0], value: def.Types.InitialDiagnosis.PromWordSpiel.replace('${ticketNumber}', ticketNum) });
                    } else if (spiel.match(def.Types.Testing.Validation)) {
                        result.Variables.push({ name: def.Conversation.Variables[0], value: def.Types.Testing.PromWordSpiel });
                    } else if (spiel.match(def.Types.Dispatched.Validation)) {
                        result.Variables.push({ name: def.Conversation.Variables[0], value: def.Types.Dispatched.PromWordSpiel.replace('${ticketNumber}', ticketNum) });
                    } else if (spiel.match(def.Types.FurtherTesting.Validation)) {
                        result.Variables.push({ name: def.Conversation.Variables[0], value: def.Types.FurtherTesting.PromWordSpiel });
                    } else if (spiel.match(def.Types.Resolved.Validation)) {
                        result.Variables.push({ name: def.Conversation.Variables[0], value: def.Types.Resolved.PromWordSpiel });
                    } else {
                        result.Variables.push({ name: def.Conversation.Variables[0], value: def.Types.Deafult.PromWordSpiel.replace('${ticketNumber}', ticketNum) });
                    }
                    result.Transition = def.Conversation.Transition;
                    break;

            }
            break;
        case types.WithOpenSO.Message:
            logger.debug(`[Response Message]: ${types.WithOpenSO.Message}`);
            logger.debug(`[Spiel]: ${spiel}`);

            if (spiel.match(globalProp.AccountEligibility.Validation.DigitsOnly)) {
                var soMatches = spiel.split(globalProp.AccountEligibility.Validation.NumberRange);
                var soNum = soMatches[1];
                result.Variables.push({ name: types.WithOpenSO.Conversation.Variables[1], value: soNum });
            }
            else
                result.Variables.push({ name: types.WithOpenSO.Conversation.Variables[1], value: "undefined" });

            result.Variables.push({ name: types.WithOpenSO.Conversation.Variables[0], value: spiel });
            result.Transition = types.WithOpenSO.Conversation.Transition;
            break;
        case types.WithOpenTransferSO.Message:
            logger.debug(`[Response Message]: ${types.WithOpenTransferSO.Message}`);
            logger.debug(`[Spiel]: ${spiel}`);

            var matches = spiel.match(globalProp.AccountEligibility.Validation.DigitsOnly);
            result.Variables.push({ name: types.WithOpenTransferSO.Conversation.Variables[0], value: spiel });
            result.Variables.push({ name: types.WithOpenTransferSO.Conversation.Variables[1], value: matches });
            result.Transition = types.WithOpenTransferSO.Conversation.Transition;
            break;
        case types.InvalidServiceNumber.Message:
            logger.debug(`[Message]: Invalid Service Number`);
            result.Transition = types.InvalidServiceNumber.Conversation.Transition;
            break;
        default:
            logger.debug(`[Spiel]: ${spiel}`);

            var matches = spiel.match(globalProp.AccountEligibility.Validation.DigitsOnly);
            result.Variables.push({ name: types.OpenOrder.Conversation.Variables[0], value: spiel });
            result.Variables.push({ name: types.OpenOrder.Conversation.Variables[1], value: matches });
            result.Transition = types.OpenOrder.Conversation.Transition;
            break;
    }
    return result;
}

module.exports = {
    LoggerInstance: (instance) => { logger = instance },
    LoggerStart: LoggerStart,
    LoggerEnd: LoggerEnd,
    Process: Logic,
    ErrorResponse:ErrorResponse,
    EmailSender: EmailSender
}