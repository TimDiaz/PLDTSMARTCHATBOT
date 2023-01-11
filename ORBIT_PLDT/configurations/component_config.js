const baseConfig = require('./base_config');
const config = {
    AccountValidation: `accountValidation.${baseConfig.Environment}`,
    HomeRewards: `homerewards.${baseConfig.Environment}`,
    Serviceability: `serviceability.${baseConfig.Environment}`,
    TSEligibility: `tseligibility.${baseConfig.Environment}`,
    Reconnection: `reconnection.${baseConfig.Environment}`,
    NumberServiceabilityPARAM: `numberServiceabilityPARAM.${baseConfig.Environment}`,
    NumberServiceabilityRegion: `numberServiceabilityRegion.${baseConfig.Environment}`,
    NumberServiceabilityTechnology: `numberServiceabilityTechnology.${baseConfig.Environment}`,

    ValidateAccountNumberFormat: `validateaccountnumberformat.${baseConfig.Environment}`,
    ValidateServiceNumberFormat: `validateServiceNumberFormat.${baseConfig.Environment}`,
    ValidateServiceRequestNumberFormat: `validateServiceRequestNumberFormat.${baseConfig.Environment}`,
    CaseCreation: `casecreation.${baseConfig.Environment}`,
    ChatAdCaseCreate: `chatadcasecreate.${baseConfig.Environment}`,
    CheckWaitTime: `checkwaittime.${baseConfig.Environment}`,
    FollowUpCase: `followupcase.${baseConfig.Environment}`,
    FollowUpDate: `followupdate.${baseConfig.Environment}`,
    PaymentDate: `paymentdate.${baseConfig.Environment}`,
    ValidateEmailFormat: `validateEmailFormat.${baseConfig.Environment}`,
    ValidateMobileFormat: `validateMobileFormat.${baseConfig.Environment}`,
    TicketCreation: `ticketCreation.${baseConfig.Environment}`,
    TicketCreationFT: `ticketCreationFT.${baseConfig.Environment}`,
    TicketCreationProm: `ticketProm.${baseConfig.Environment}`,
    BSMPWhiteList: `BSMPWhitelistChecker.${baseConfig.Environment}`,
    BSMPChecker: `bsmpchecker.${baseConfig.Environment}`,
    BSMPTimer: {
        DSL: `bsmptimerdsl.${baseConfig.Environment}`,
        FIBR: `bsmptimerfibr.${baseConfig.Environment}`
    },
    BillingServices: {
        Autobal: `autobal.${baseConfig.Environment}`,
        Autoesoa: `autoesoa.${baseConfig.Environment}`,
        AccounetBalance: `accountbalance.${baseConfig.Environment}`,
    },
    FMgetFTDetails:  { 
        CheckNEtype: `checkNEtype.${baseConfig.Environment}`,
        CheckSType: `checkStype.${baseConfig.Environment}`,
        FMInternet: `fmInternet.${baseConfig.Environment}`,
        FMLandline: `fmLandline.${baseConfig.Environment}`
    },
    ESWUP: { GetDownTime: `eswupGetDownTime.${baseConfig.Environment}`},
}

module.exports = config;