'use strict';

const baseConfig = require('./base_config');

const environment = baseConfig.Environment.toLowerCase();
const wssLogger = {
    Protocol: 'wss',
    URL: "staging.chatbot171.pldthome.com",//baseConfig.ChatBotBaseUrl.replace(/(^\w+:|^)\/\//, ''),
    Port: 5000
};

const bcpLogging = {
    URL: `${baseConfig.ChatBotBaseUrl}:7745/bcplogginginsert`,
    AppNames: {
        AccountValidation: `orbit_${environment}-accountvalidation`,
        EmailValidation: `orbit_${environment}-emailvalidation`,
        MobileValidation: `orbit_${environment}-mobilevalidation`,
        NumberServiceability:{
            Param: `orbit_${environment}-numberserviceability-Param`,
            Region: `orbit_${environment}-numberserviceability-Region`,
            Technology: `orbit_${environment}-numberserviceability-Techonology`
        },
        AccountEligibility: { 
            TSEligibility: `orbit_${environment}-accounteligibility-TSEligibility`
        },
        CaseCreation:{
            CaseCreation: `orbit_${environment}-casecreation-CaseCreation`,
            ChatAdCaseCreate: `orbit_${environment}-casecreation-ChatAdCaseCreate`,
            CheckWaitTime: `orbit_${environment}-casecreation-CheckWaitTime`,
            FollowupCase: `orbit_${environment}-casecreation-FollowupCase`,
            FollowupDate: `orbit_${environment}-casecreation-FollowupDate`,
            PaymentDate: `orbit_${environment}-casecreation-PaymentDate`
        },
        TicketCreation:{
           TicketCreation: `orbit_${environment}-ticketCreation`,
           TicketCreationCreateFt: `orbit_${environment}-ticketcreationft`,
           TicketProm: `orbit_${environment}-ticketProm` 
        },
        BSMP:{
            BSMPWhitelistChecker: `orbit_${environment}-bsmpwhitelistchecker`,
            BSMPChecker: `orbit_${environment}-bsmpchecker`
         },
        BillingServices:{
            Autobal: `orbit_${environment}-autobal-Autobal`,
            Autoesoa: `orbit_${environment}-autoesoa-Autoesoa`
        },
        FMgetFTDetails: {
            CheckSType: `orbit_${environment}-fmgetftdetails-CheckSType`,
            FMInternet: `orbit_${environment}-fmgetftdetails-FMInternet`,
            FMLandline: `orbit_${environment}-fmgetftdetails-FMLandline`
        },
        Reconnection: `orbit_${environment}-reconnection`,
    },
}

module.exports = {     
    WSSLogger: wssLogger,
    BCPLogging: bcpLogging,
    Layout: {
        type: 'pattern',
        pattern: '[%x{dateTime}] [%p] [%c] %m',
        tokens: {
            dateTime: function(logEvent) {
                return moment.tz(Date.now(), 'Asia/Manila').format('MM-DD-YYYY hh:mm:ss.SSS A');
            },
        }
    },
    Category: {
        Default: 'default',
        Mailer: 'mailer',
        AccountValidation: 'AccountValidation',
        HomeRewards: 'HomeRewards',
        Serviceability: 'Serviceability',
        AccountEligibility: 'AccountEligibility',
        Reconnection: 'Reconnection',
        ValidateAccountNumberFormat: 'ValidateAccountNumberFormat',
        ValidateServiceNumberFormat: 'ValidateServiceNumberFormat',
        FMGetFTDetail: {
            CheckStype: 'FMGetFTDetail_CheckStype',
            FMInternet: 'FMGetFTDetail_FMInternet',
            FMLandline: 'FMGetFTDetail_FMLandline',
        },
        BillingServices: {
            Autobal: 'Autobalance',
            Autoesoa: 'AutoESOA'
        },
        ValidateEmailFormat: 'ValidateEmailFormat',
        ValidateMobileFormat: 'ValidateMobileFormat',
        NumberServiceability: {
            NumberServiceabilityParam:'NumberServiceabilityParam',
            NumberServiceabilityRegion:'NumberServiceabilityRegion',
            NumberServiceabilityTechnology:'NumberServiceabilityTechnology'},
        TicketCreation: {
            TicketCreation:'TicketCreation',
            ticketcreationcreateft:'ticketcreationcreateft',
            ticketProm:'ticketProm'},
        BSMP: {
            BSMPWhitelistChecker:'BSMPWhitelistChecker',
            BSMPChecker:'BSMPChecker'},
        NumberServiceabilityParam: 'NumberServiceabilityParam',
        CaseCreation: {
            CaseCreation: 'CaseCreation', 
            ChatAdCaseCreate: 'ChatAdCaseCreate', 
            CheckWaitTime: 'CheckWaitTime', 
            FollowUpCase: 'FollowUpCase', 
            FollowUpDate: 'FollowUpDate', 
            PaymentDate: 'PaymentDate'},
        ESWUP: { GetDownTime: 'ESWUP_GetDownTime' }
    }
}