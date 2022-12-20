const globalProp = require('../helpers/globalProperties');
const emailSender = require('../helpers/emailsender');

let logger;

const RegionEmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.NumberServiceability.API.Serviceable.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);

    if (isOn)
        emailSender(globalProp.Email.Subjects.NumberServiceability.Region, message, globalProp.Logger.BCPLogging.AppNames.NumberServiceability.Region, strResult, resultCode, accountNumber, serviceNumber)
}

const ParamEmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.NumberServiceability.API.Serviceable.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);

    if (isOn)
        emailSender(globalProp.Email.Subjects.NumberServiceability.Param, message, globalProp.Logger.BCPLogging.AppNames.NumberServiceability.Param, strResult, resultCode, accountNumber, serviceNumber)
}

const TechEmailSender = (result, resultCode, serviceNumber, accountNumber, isOn = true) => {
    const strResult = JSON.stringify(result);
    const message = globalProp.Email.EmailFormat(globalProp.NumberServiceability.API.Serviceable.Name, resultCode, strResult, serviceNumber);
    logger.error(`[ERROR]: ${strResult}`);

    if (isOn)
        emailSender(globalProp.Email.Subjects.NumberServiceability.Technology, message, globalProp.Logger.BCPLogging.AppNames.NumberServiceability.Technology, strResult, resultCode, accountNumber, serviceNumber)
}

const RegionLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Number Serviceability - [Region]                                                                  -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const RegionLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Number Serviceability - [Region]                                                                    -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const ParamLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Number Serviceability - [PARAM]                                                                   -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const ParamLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Number Serviceability - [PARAM]                                                                     -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const TechLoggerStart = () => {
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [START] Number Serviceability - [Technology]                                                              -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const TechLoggerEnd = (transition) => {
    logger.info(`[Transition]: ${transition}`);
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
    logger.info(`- [END] Number Serviceability - [Technology]                                                                -`)
    logger.info(`-------------------------------------------------------------------------------------------------------------`)
}

const RegionLogic = (statusCode, body, accountNumber, serviceNumber, sendEmail = true) => {
    let result = {
        Transition: 'failure',
        Variables: [],
        Reply: []
    }

    if (statusCode > 200) {
        RegionEmailSender(body, statusCode, serviceNumber, accountNumber, sendEmail)
    }
    else {
        logger.info(`Request success with Response Code: [${statusCode}]`);
        var responseBody = body;
        var JSONRes = JSON.parse(responseBody);
        logger.debug(`Response Body:  ${JSON.stringify(JSONRes)}`);

        // send line capability validation
        var lineCapability = JSONRes.LINECAPABILITY.toUpperCase();
        result.Variables.push({ name: 'lineCapability', value: lineCapability });
        // end line capability

        var parameter_city = JSONRes.PARAM2 == null || JSONRes.PARAM2 == undefined ? null : JSONRes.PARAM2.toUpperCase();
        var PARAM2 = parameter_city;

        logger.debug("PARAM2 :", parameter_city);

        if (JSONRes.EXCEPTIONMSG === "") {
            if (parameter_city == "VISAYAS" || parameter_city == "SOUTH MINDANAO" || parameter_city == "NORTH MINDANAO") {
                result.Transition = 'VIZMIN';
            }
            else if (parameter_city == "SOUTH LUZON" || parameter_city == "NORTH LUZON") {
                result.Transition = 'LUZON';
            }
            else if (parameter_city == "GMM NORTH" || parameter_city == "GMM SOUTH" || parameter_city == "GMM EAST" || parameter_city == "GMM WEST") {
                result.Transition = 'METRO';
            }
            else if (parameter_city == null) {
                result.Transition = 'blank';
            }
            else {
                result.Variables.push({ name: 'neType', value: "NULL NE TYPE" });
                result.Transition = 'blank';
                logger.debug("getRegion component, blank argument service number:" + serviceNumber, "PARAM2: " + PARAM2);
            }
        }
        else {
            if (JSONRes.EXCEPTIONMSG == "100|TELEPHONE NUMBER DOES NOT EXIST") {
                logger.debug("getRegion telephone number does not exist service number:" + serviceNumber);
                result.Transition = 'blank';
            }
            else {
                result.Transition = 'blank';
                logger.debug("getRegion - CLARITY ERROR. Server was unable to process request.:" + serviceNumber, "parameter_city :" + parameter_city);
            }
        }

        result.Variables.push({ name: 'PARAM2', value: PARAM2 });
    }

    return result;
}

const ParamLogic = (statusCode, body, accountNumber, serviceNumber, sendEmail = true) => {
    let result = {
        Transition: 'failure',
        Variables: [],
        Reply: []
    }

    logger.info(`Request success with Response Code: [${statusCode}]`);
    var responseBody = body;

    if (statusCode > 200) {
        RegionEmailSender(body, statusCode, serviceNumber, accountNumber, sendEmail)
        result.Transition = 'failure';
        switch (statusCode) {
            case 504: case 406: case 500: case 404: case 408: case 400:
                result.Variables.push({ name: 'errorCode', value: statusCode });
                break;
        }
    }
    else {
        const JSONRes = JSON.parse(responseBody);

        logger.debug(`Response Body:  ${JSON.stringify(JSONRes)}`);


        const paramcity = JSONRes.PARAM3 == null || JSONRes.PARAM3 == undefined ? null : JSONRes.PARAM3.toUpperCase().toString()
        const param1 = JSONRes.PARAM1 == null || JSONRes.PARAM1 == undefined ? null : JSONRes.PARAM1.toUpperCase().toString()
        const fullcity = param1 + "-" + paramcity;

        logger.debug(`City Code: [${param1}].`);
        logger.debug(`City: [${paramcity}].`);
        logger.debug(`Full City: [${fullcity}].`);

        result.Variables.push({ name: 'PARAM3', value: fullcity });
        if (JSONRes.EXCEPTIONMSG !== "") {
            result.Transition = 'blank';
            switch (JSONRes.EXCEPTIONMSG) {
                case "100|TELEPHONE NUMBER DOES NOT EXIST":
                    logger.debug(`Telephone number does not exist service number: [${serviceNumber}].`);
                    break;
                default:
                    logger.debug(`CLARITY ERROR. Server was unable to process request: [${paramcity}].`);
                    break;
            }
        }
        else {
            if ((paramcity === "CALAMBA CITY" && param1 === "CLA") ||
                (paramcity === "DASMARINAS CITY" && param1 === "CVE") ||
                (paramcity === "QUEZON CITY" && param1 === "QCY") ||
                (paramcity === "ANGELES CITY" && param1 === "SFP") ||
                (paramcity === "MANDAUE CITY" && param1 === "MDE") ||
                (paramcity === "TALISAY CITY" && param1 === "JNE") ||
                (paramcity === "CEBU CITY" && param1 === "MDE")) {
                result.Transition = 'VipZone';

            }
            else if (paramcity === "VALENZUELA CITY") {
                result.Transition = 'param3';
            }
            else if (paramcity === null) {
                result.Transition = 'blank';
            }
            else {
                result.Variables.push({ name: 'neType', value: "NULL NE TYPE" });
                result.Transition = 'blank';
                logger.debug(" GET PARAM Component, blank argument service number:" + serviceNumber, "PARAM3: ", fullcity);
            }
        }
    }

    return result;
}

const technology = {
    pkgfttx: "FTTX",
    pkgftth: "FTTH",
    pkgfiber: "FIBER",
    pkgfibr: "FIBR",
    pkgdsl: "DSL",
    pkgvdsl: "VDSL",
    pkgngn: "NGN",
    pkglegacy: "LEGACY"

}
const TechLogic = (statusCode, body, accountNumber, serviceNumber, sendEmail = true) => {
    let result = {
        Transition: 'failure',
        Variables: [],
        Reply: []
    }

    logger.info(`Request success with Response Code: [${statusCode}]`);

    if (statusCode > 200) {
        TechEmailSender(body, statusCode, serviceNumber, accountNumber, sendEmail)
    }
    else {
        logger.info(`Request success with Response Code: [${statusCode}]`);
        var JSONRes = JSON.parse(body);
        logger.debug(`Response Body:  ${JSON.stringify(JSONRes)}`);

        var currentTech = JSONRes.CURRENTTECHNOLOGY == null || JSONRes.CURRENTTECHNOLOGY == undefined ? null : JSONRes.CURRENTTECHNOLOGY.toUpperCase();
        if (JSONRes.EXCEPTIONMSG == "") {
            if (currentTech == technology.pkgfttx ||
                currentTech == technology.pkgfiber ||
                currentTech == technology.pkgfibr ||
                currentTech == technology.pkgftth) {
                result.Variables.push({ name: 'neType', value: currentTech });
                result.Transition = 'fibrAcct';
            }
            else if (currentTech == technology.pkgdsl ||
                currentTech == technology.pkgvdsl ||
                currentTech == technology.pkgngn ||
                currentTech == technology.pkglegacy) {
                result.Variables.push({ name: 'neType', value: currentTech });
                result.Transition = 'dslAcct';
            }
            else {
                result.Variables.push({ name: 'neType', value: "NULL NE TYPE" });
                logger.debug("getTechnology component ,blank argument service number:" + serviceNumber, "currentTech: " + currentTech);
                result.Transition = 'blank';
            }
        }
        else {
            if (JSONRes.EXCEPTIONMSG == "100|TELEPHONE NUMBER DOES NOT EXIST") {
                logger.debug("getTechnology telephone number does not exist service number:" + serviceNumber, "currentTech : " + currentTech);
                result.Transition = 'blank';
            }
            else {
                logger.debug("getTechnology - number CLARITY ERROR. Server was unable to process request." + serviceNumber, "currentTech : " + currentTech);
                result.Transition = 'blank';
            }
        }
    }

    return result;
}


module.exports = {
    LoggerInstance: (instance) => { logger = instance },
    RegionLoggerStart: RegionLoggerStart,
    RegionLoggerEnd: RegionLoggerEnd,
    RegionProcess: RegionLogic,
    RegionEmailSender: RegionEmailSender,
    ParamLoggerStart: ParamLoggerStart,
    ParamLoggerEnd: ParamLoggerEnd,
    ParamProcess: ParamLogic,
    ParamEmailSender: ParamEmailSender,
    TechLoggerStart: TechLoggerStart,
    TechLoggerEnd: TechLoggerEnd,
    TechProcess: TechLogic,
    TechEmailSender: TechEmailSender
}
