const moment = require('moment-timezone');
const baseConfig = require('./base_config');

module.exports = {
    URL: 'https://staging.chatbot171.pldthome.com:7746/sendEmail', //`${baseConfig.ChatBotBaseUrl}:7746/sendEmail`,
    Subjects: {
        AccountValidation: `[API Error] ${baseConfig.EmailTenant} Account Validation ${baseConfig.Environment} - Subscriber Checking`,
        AccountEligibility: `[API Error] ${baseConfig.EmailTenant} Account Eligibility ${baseConfig.Environment} - Existing Ticket Checking`,
        BillingServices:{
            Autobal: `[API Error] ${baseConfig.EmailTenant} Check Auto Balance ${baseConfig.Environment} - Balance Checking`,
            Autoesoa: `[API Error] ${baseConfig.EmailTenant} Check Auto Esoa ${baseConfig.Environment} - Bill Request Checking`
        },
        FMgetFTDetails: {
            CheckSType: `[API Error] ${baseConfig.EmailTenant} FmGetFtDetails ${baseConfig.Environment} - NE Type Checking`,
            FMInternet: `[API Error] ${baseConfig.EmailTenant} FmGetFtDetails ${baseConfig.Environment} - NE Type Checking`,
            FMLandline: `[API Error] ${baseConfig.EmailTenant} FmGetFtDetails ${baseConfig.Environment} - NE Type Checking`,
        },
        TicketCreation: {
            TicketCreation:`[API Error] ${baseConfig.EmailTenant} Fault Ticket ${baseConfig.Environment} - Ticket Creation`,
            CreateFT:`[API Error] ${baseConfig.EmailTenant} Fault Ticket ${baseConfig.Environment} - Ticket Creation Create FT`,
            TicketProm:`[API Error] ${baseConfig.EmailTenant} Fault Ticket ${baseConfig.Environment} - Ticket Prom`}, 
        BSMP: { 
            BSMPWhitelistChecker: `[API Error] ${baseConfig.EmailTenant} BSMP ${baseConfig.Environment} - Whitelist Checker`, 
            BSMPChecker: `[API Error] ${baseConfig.EmailTenant} BSMP ${baseConfig.Environment} - Checker`},
        CaseCreation: {
            CaseCreation: `[API Error] ${baseConfig.EmailTenant} CaseCreation ${baseConfig.Environment} - Case Creation`,
            ChatAdCaseCreate: `[API Error] ${baseConfig.EmailTenant} ChatAdCaseCreate ${baseConfig.Environment} - Chat AD Case Creation`,
            CheckWaitTime: `[API Error] ${baseConfig.EmailTenant} CheckWaitTime ${baseConfig.Environment} - Live agent wait time checking`,
            FollowUpCase: `[API Error] ${baseConfig.EmailTenant} FollowUpCase ${baseConfig.Environment} - Case Creation for Tech`,
            FollowUpDate: `[API Error] ${baseConfig.EmailTenant} FollowUpDate ${baseConfig.Environment} - Date validation`,
            PaymentDate: `[API Error] ${baseConfig.EmailTenant} PaymentDate ${baseConfig.Environment} - Payment Date validation`},
        NumberServiceability: {
            Region: `[API Error] ${baseConfig.EmailTenant} NumberServiceability  ${baseConfig.Environment} - Region Checking`,
            Param: `[API Error] ${baseConfig.EmailTenant} NumberServiceability  ${baseConfig.Environment} - Param Checking`,
            Technology: `[API Error] ${baseConfig.EmailTenant} NumberServiceability  ${baseConfig.Environment} - Technology Checking`,
        }
    },
    EmailFormat: (apiName, code, message, serviceNumber) => {
        const dateTimeNow = moment.tz(Date.now(), `Asia/Manila`).format(`MM-DD-YYYY hh:mm A`);
        return `Status Code: ${code} 
                Telephone Number: ${serviceNumber} 
                API: ${apiName} 
                Datetime: ${dateTimeNow} 
                Error: ${message}`;
    }
}