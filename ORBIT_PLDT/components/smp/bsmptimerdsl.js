"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.BSMPTimer.DSL,
        properties: {
            Mobile: {
                type: "string",
                required: false
            },
            AccountNumber: {
                type: "string",
                required: false
            },
            sysDate: {
                type: "string",
                required: false
            },
        },
        supportedActions: ['createft', 'directtoagent', 'timerswitch']
    }),
    invoke: (conversation, done) => {

        const request = require('request');
        const xml2js = require('xml2js');
        const fetch = require('node-fetch');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        const _logger = instance.logger(globalProp.BSMPTimer.Type.DSL);
        const logger = _logger.getLogger();

        const finishedProcessingAPI = false;
        const intCounter = 0;
        const telNumber = conversation.properties().Mobile;
        const smpNeType = 'dsl';
        const accNumber = conversation.properties().AccountNumber;
        const smpStartTs = conversation.properties().sysDate;

        var extractedDataFinal;
        let retry = 0;
        const maxRetry = 3;

        let transitionAction = 'directtoagent';

        var InsertData = (accountNumber, telNumber, smpStart, smpType, lsCode, timerCount) => {
            logger.info(`[INSERT REQUEST] ---------------------------------------------------------------------------------------------`);
            var data = { "AccountNumber": accountNumber, "TelephoneNumber": telNumber, "smpTS": smpStart, "smpNeType": smpType, "lsCode": lsCode, "timerCount": timerCount };
            var option = globalProp.BSMPTimer.API.InsertData.PostOption(data);
            logger.info(`[INSERT REQUEST OPTION] ${JSON.stringify(option)}`);
            fetch(globalProp.BSMPTimer.API.InsertData.URL, option).then((response) => {
                if (response.status > 200) {
                    logger.error(`[INSERT ERROR] ${response.statusText}`);
                } else {
                    logger.info(`[INSERT RESPONSE] ${JSON.stringify(response)}`);
                }
            }).catch((error) => {
                logger.error(`[INSERT ERROR] ${error}`);
            });
        }

        logger.start = () => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] BSMP Timer - [DSL]                                                                                -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        }

        logger.end = () => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] BSMP Timer - [DSL]                                                                                  -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            conversation.transition(transitionAction);
            done();
            _logger.shutdown();
        }

        logger.addContext("serviceNumber", telNumber)

        logger.start();

        var Process = () => {
            logger.info(`[RETRY] Counter : ${retry}`);
            switch (retry) {
                case 1:
                    conversation.reply(`Please hold while we check on your line status. We appreciate your patience.`);
                    conversation.keepTurn(true);
                    logger.info(`Please hold while we check on your line status. We appreciate your patience.`);
                    break;
                case 2:
                    conversation.reply(`Thank you for choosing to wait, we are still validating your line status. We’ll attend to you in a short.`);
                    conversation.keepTurn(true);
                    logger.info(`Thank you for choosing to wait, we are still validating your line status. We’ll attend to you in a short.`);
                    break;
            }
            conversation.variable("smpcounter", retry);

            const options = globalProp.BSMPTimer.API.PostOptions(telNumber);
            logger.info(`[SOAP REQUEST OPTION] ${JSON.stringify(options)}`);
            request(options, function (error, response) {
                if (error) {
                    logger.error(`[SOAP ERROR] ${error}`);

                    retry++;
                    if(retry < maxRetry){
                        Process();
                    }
                    else{
                        InsertData(accNumber, telNumber, smpStartTs, smpNeType, "NO RESPONSE", retry);
                        logger.end();
                    }
                }
                else {
                    if (response.statusCode > 200) {
                        InsertData(accNumber, telNumber, smpStartTs, smpNeType, "NO RESPONSE", retry);
                        logger.error(`[SOAP ERROR] ${response}`);
                        logger.end();
                    }
                    else {
                        var extractedData = "";
                        var parser = new xml2js.Parser();

                        parser.parseString(response.body, function (err, result) {
                            logger.info(`Parsing XML Body Response`);
                            extractedData = result["soapenv:Envelope"]["soapenv:Body"][0]["ns:getDataResponse"][0]["ns:return"][0];
                            logger.info(`Parsing XML Body Response Success`);
                        });

                        if (extractedData != null) {
                            if (typeof extractedData["ax253:entries"] !== undefined && typeof extractedData["ax253:entries"] !== "undefined") {
                                var finalExtractedData = JSON.stringify(extractedData["ax253:entries"]["0"]["ax253:values"]);

                                var word = 'line.summary.action.code';
                                var re = new RegExp('\\b' + word + '\\b', 'i')
                                var z = re.exec(finalExtractedData);

                                var n = finalExtractedData.search(word);
                                var x = Number(n) + 41;
                                var y = Number(n) + 55;

                                logger.info(`[PARSED BODY] search_1: ${z}`);
                                logger.info(`[PARSED BODY] search_2: ${n}`);

                                var firstStringChar2 = finalExtractedData.substring(x, y);
                                logger.info(`[PARSED BODY] LS Code: ${firstStringChar2.replace(/[ \[\]'"$,{}:]+/g, '')}`);

                                var extractvalue = firstStringChar2.replace(/[ \[\]'"$,{}:]+/g, '').trim();
                                logger.info(`[PARSED BODY] Status Code: ${extractvalue}`);

                                extractedDataFinal = JSON.stringify(extractvalue);
                            } else {
                                extractedDataFinal = JSON.stringify(extractedData["ax253:message"]).replace(/[ \[\]'"$,{}:]+/g, '');
                                logger.warn(`[PARSED BODY] No LSCode`);
                            }

                        } else {
                            extractedDataFinal = JSON.stringify(extractedData)
                            logger.warn(`[PARSED BODY] NULL Extracted DATA`);
                        }
                        InsertData(accNumber, telNumber, smpStartTs, smpNeType, extractedDataFinal, retry);
                        logger.end();
                    }
                }
            });
        }
        Process();
    }
};





