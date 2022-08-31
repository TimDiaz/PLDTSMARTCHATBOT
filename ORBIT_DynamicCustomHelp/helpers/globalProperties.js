const apiBaseConfig = require('./configurations/apiBase_config');
const loggerConfig = require('./configurations/logger_config');
const emailConfig = require('./configurations/email_config');
const accountValidationConfig = require('./configurations/modules/accountValidation_config');
const numberServiceabilityConfig = require('./configurations/modules/numberServiceability_config');
const validateAccountNumberFormatConfig = require('./configurations/modules/validateAccountNumberFormat_config');
const validateServiceNumberFormatConfig = require('./configurations/modules/validateServiceNumberFormat_config');

module.exports = {    
    APIBaseOption: apiBaseConfig,
    Logger: loggerConfig,
    Email:emailConfig,
    AccountValidation: accountValidationConfig,
    NumberServiceability: numberServiceabilityConfig,
    ValidateAccountNumberFormat: validateAccountNumberFormatConfig,
    ValidateServiceNumberFormat: validateServiceNumberFormatConfig
};