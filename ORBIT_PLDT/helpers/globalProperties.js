const baseConfig = require('../configurations/base_config');
const loggerConfig = require('../configurations/logger_config');
const emailConfig = require('../configurations/email_config');
const accountValidationConfig = require('../configurations/components/accountValidation_config');
const accountEligibilityConfig = require('../configurations/components/tsEligibility_config');
const numberServiceabilityConfig = require('../configurations/components/numberServiceability_config');
const validateAccountNumberFormatConfig = require('../configurations/components/validateAccountNumberFormat_config');
const validateServiceNumberFormatConfig = require('../configurations/components/validateServiceNumberFormat_config');
const caseCreationConfig = require('../configurations/components/caseCreation_config');
const checkWaitTimeConfig = require('../configurations/components/checkWaitTime_config');
const followUpCaseConfig = require('../configurations/components/followUpCase_config');
const ChatAdCaseCreateConfig = require('../configurations/components/chatAdCaseCreate_config');
const autobalConfig = require('../configurations/components/autobal_config');
const autoesoaConfig = require('../configurations/components/autoesoa_config');
const fmGetFTDetailsConfig = require('../configurations/components/fmGetFTDetails_config');
const validateEmailFormatConfig = require('../configurations/components/validateEmailFormat_config');
const ticketCreationConfig = require('../configurations/components/ticketCreation_config');
const bsmpCheckerConfig = require('../configurations/components/bsmpChecker_config');
const bsmpTimerConfig = require('../configurations/components/bsmpTimer_config');
const reconnectionConfig = require('../configurations/components/reconnection_config');
const serviceabilityConfig = require('../configurations/components/serviceability_config');
module.exports = {    
    APIBaseOption: baseConfig,
    Logger: loggerConfig,
    Email:emailConfig,
    AccountValidation: accountValidationConfig,
    AccountEligibility: accountEligibilityConfig,
    NumberServiceability: numberServiceabilityConfig,
    Serviceability: serviceabilityConfig,
    ValidateAccountNumberFormat: validateAccountNumberFormatConfig,
    ValidateServiceNumberFormat: validateServiceNumberFormatConfig,
    CaseCreation: caseCreationConfig,
    CheckWaitTime: checkWaitTimeConfig,
    FollowUpCase: followUpCaseConfig,
    ChatAdCaseCreate: ChatAdCaseCreateConfig,
    ValidateEmailFormat: validateEmailFormatConfig,
    TicketCreation: ticketCreationConfig,
    BillingServices: {
        Autobal: autobalConfig,
        Autoesoa: autoesoaConfig
    },
    FMGetFTDetails: fmGetFTDetailsConfig,
    BSMPChecker: bsmpCheckerConfig,
    BSMPTimer: bsmpTimerConfig,
    Reconnection: reconnectionConfig
};