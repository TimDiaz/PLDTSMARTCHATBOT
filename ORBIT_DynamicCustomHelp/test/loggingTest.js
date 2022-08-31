const request = require('request');
const globalProp = require('../helpers/globalProperties');
const instance = require("../helpers/logger");
const _logger = instance.logger("loggingTest", "TEST TEST TEST", "TEST");
const logger = _logger.getLogger();
//const emailLog = _logger.logger("mailer", "TEST TEST TEST", "TEST");


const message = JSON.stringify(globalProp.Email.EmailFormat("TEST", 200, "TEST TEST TEST TEST TEST", "0000000001", "0000000010"));

logger.info(` Message: ${message}`);
logger.warn(` Message: ${message}`);
logger.error(` Message: ${message}`);
logger.debug(` Message: ${message}`);
logger.trace(` Message: ${message}`);
//emailLog.error(message);

_logger.shutdown();