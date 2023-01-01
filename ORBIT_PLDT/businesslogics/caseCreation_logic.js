const moment = require('moment');
const globalProp = require('../helpers/globalProperties');
const emailSender = require('../helpers/emailsender');

let logger;

const CheckWaitTimeEmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.ChatAdCaseCreate.API.ChatAdToken.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);

    if (isOn)
        emailSender(globalProp.Email.Subjects.CaseCreation.CheckWaitTime, message, globalProp.Logger.BCPLogging.AppNames.CaseCreation.CheckWaitTime, strResult, resultCode, accountNumber, serviceNumber)
}

const PaymentDateLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Payment Date                                                                                      -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const PaymentDateLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Payment Date                                                                                        -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const FollowupDateLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Follow Up Date                                                                                    -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const FollowupLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Follow Up Date                                                                                      -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const CheckWaitTimeLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Check Wait Time                                                                                   -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const CheckWaitTimeLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Check Wait Time                                                                                     -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const PaymentDateLogic = (userDate) => {
    let result = {
        Transition: 'invalidDate',
        KeepTurn: true
    }
    
    const date1 = new Date();
    const date2 = new Date(userDate);
    const givenDate = new Date(userDate);
    const givenDate2 = givenDate.getTime();
    const formattedGivenDate = ((givenDate.getMonth() > 8) ? (givenDate.getMonth() + 1) : ('0' + (givenDate.getMonth() + 1))) + '/' + ((givenDate.getDate() > 9) ? givenDate.getDate() : ('0' + givenDate.getDate())) + '/' + givenDate.getFullYear();
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const CurrentDate = new Date();
    const CurrentDate2 = CurrentDate.getTime();
    const formattedCurrentDate = ((CurrentDate.getMonth() > 8) ? (CurrentDate.getMonth() + 1) : ('0' + (CurrentDate.getMonth() + 1))) + '/' + ((CurrentDate.getDate() > 9) ? CurrentDate.getDate() : ('0' + CurrentDate.getDate())) + '/' + CurrentDate.getFullYear();

    logger.info(`[USER DATE] ${userDate}`)
    logger.info(`[DATE DIFFERENCE] ${diffDays}`)

    logger.info(`[DATE TODAY] ${formattedCurrentDate}`)
    logger.info(`[USER DATE FORMATTED] ${formattedGivenDate}`)

    //User input Date is not older that 3 days of todays date
    if (moment(userDate, 'MM/DD/YYYY', true).isValid()) {
        if (diffDays <= 3 && givenDate2 >= CurrentDate2) {
            logger.debug(`Valid Date Format!`);
            result.Transition = 'validDate';
        }else if (formattedGivenDate == formattedCurrentDate){
            logger.debug(`Valid Date Format!`);
            result.Transition = 'validDate';
        }else{
            logger.debug(`Invalid date futuristic`);
            result.Transition = 'invalidDate';
        }
    }else{
        logger.debug(`Invalid Date more than 3 days of current date`);
        result.Transition = 'InvalidDate';
    }

    return result;
}

const FollowupDateLogic = (userDate) => {
    let result = {
        Transition: 'invalidDate',
        KeepTurn: true
    }
        
    var givenDate = new Date(userDate);
    var CurrentDate = new Date();
    
    logger.info(`[DATE TODAY] ${CurrentDate}`)
    logger.info(`[USER DATE] ${givenDate}`)

    //User input Date is not older that 3 days of todays date
    if (moment(userDate, 'MM/DD/YYYY', true).isValid()) {
        if (givenDate <= CurrentDate) {
            logger.debug(`Valid Date Format! ${givenDate} is less than or equal to ${CurrentDate}`);
            result.Transition = 'validDate';
        }
        else if(givenDate > CurrentDate)  {
            logger.debug(`Invalid date futuristic`);
            result.Transition = 'invalidDate';
        }
        else{
            logger.debug(`Invalid date futuristic`);
            result.Transition = 'invalidDate';
        }
    }
    else {
        logger.debug(`Invalid Date more than 3 days of current date`);
        result.Transition = 'invalidDate';
    }

    return result;
}

const GetQueueName = (deploymentid, buttonid) => {
    let queueName = '';

    if (deploymentid == '5722v000000gloF' && buttonid == '5732v000000gn4p') {
        queueName = "PLDT_Tech_Live_Chat Button";
    }else if (deploymentid == '5722v000000gloE' && buttonid == '5732v000000gn4o') {
        queueName = "PLDT_NonTech_Live_Chat Button";
    }else if (deploymentid == '5722u000000XZAR' && buttonid == '5732u0000008OIU') {
        queueName = "PLDT_FollowUp_Live_Chat Button";
    }else if (deploymentid == '5722u000000XZAW' && buttonid == '5732u0000008OIZ') {
        queueName = "PLDT_Reconnection_Live_Chat Button";
    }else if (deploymentid == '5722u0000008OJN' && buttonid == '5732u000000CaSe') {
        queueName = "PLDT_VIP_Live_Chat Button";
    }else{
        queueName = "PLDT_Default_Live_Chat Button";
    }
    return queueName;
}

const CheckWaitTimeLogic = (statusCode, body, accountNumber, serviceNumber, deploymentid, buttonid, sendEmail = true) => {
    let result = {
        Transition: 'failure',
        Variables: [],
        Reply: []
    }
        
    if(statusCode > 200){
        CheckWaitTimeEmailSender(body, statusCode, serviceNumber, accountNumber, sendEmail);
    }else{                
        //SAMPLE PARSE replace with mapped return Payload {}{}
        logger.debug(`Response Body:  ${body}`);

        const res = JSON.parse(body);
        const waitTime = JSON.stringify(res.messages[0].message.results[0].estimatedWaitTime);

        // const waitTime = 5; // seconds
        // const waitTime = 120; // for testing with queue
        // const waitTime = 1500; // for testing with queue
        // const waitTime = 1860; // for testing more than 30mins
        // const waitTime = 2400; // for testing more than 40mins
        const minuteWaitTime = Math.round((waitTime) / (60));
        const queueName = GetQueueName(deploymentid, buttonid);

        logger.info(`[Wait Time in Seconds] ${waitTime}`);
        logger.info(`[Wait Time in Minutes] ${minuteWaitTime}`);

        if(waitTime == null || waitTime == NaN || waitTime == 'undefined')
        {
            result.Variables.push({ name: 'waitTime', value: "undefined" });
            result.Variables.push({ name: 'waitTimeSec', value: 0 });
            result.Variables.push({ name: 'LiveAgent_queue', value: queueName });
            logger.error(`[No Wait Time]: ${error}`);
            result.Transition = 'failure';
        }else{
            if ((waitTime >= 1 && waitTime <= 59) || (waitTime <= 0)) {
                logger.info(`Transition ZeroMinute agentAvail`);
                result.Transition = 'agentAvail';
            }else{
                if (minuteWaitTime >= 31) {
                    result.Variables.push({ name: 'waitTimeRange', value: 'morethanthirty' });
                    logger.info(`queuePosition greater than max threshold: ${waitTime}`);
                    result.Transition = 'directToCase';
                }else{
                    logger.info(`queuePosition lower than max threshold: ${waitTime}`);
                    result.Transition ='directToAgent';
                }
            }
            result.Variables.push({ name: 'waitTime', value: minuteWaitTime });
            result.Variables.push({ name: 'waitTimeSec', value: waitTime });
            result.Variables.push({ name: 'LiveAgent_queue', value: queueName });
        }
    }

    return result;
}

module.exports = {
    LoggerInstance: (instance) => { logger = instance },
    PaymentDateLoggerStart: PaymentDateLoggerStart,
    PaymentDateLoggerEnd: PaymentDateLoggerEnd,
    PaymentDateLogic: PaymentDateLogic,
    FollowupDateLoggerStart: FollowupDateLoggerStart,
    FollowupLoggerEnd: FollowupLoggerEnd,
    FollowupDateLogic: FollowupDateLogic,
    CheckWaitTimeLoggerStart: CheckWaitTimeLoggerStart,
    CheckWaitTimeLoggerEnd: CheckWaitTimeLoggerEnd,
    CheckWaitTimeLogic: CheckWaitTimeLogic,
    CheckWaitTimeEmailSender: CheckWaitTimeEmailSender,
    GetQueueName: GetQueueName
}
