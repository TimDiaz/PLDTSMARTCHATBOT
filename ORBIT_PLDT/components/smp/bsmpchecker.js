"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.BSMPChecker,
        properties: {
            Mobile: {
                type: "string",
                required: false
            },
            accountNumber: {
                type: "string",
                required: false
            },
            sysDate: {
                type: "string",
                required: false
            },
        },
        supportedActions: ['createft', 'directtoagent', 'nodata3', 'serverdown']
    }),
    invoke: (conversation, done) => {
        const fetch = require('node-fetch');
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        const _logger = instance.logger(globalProp.BSMPChecker.API.Name);
        const logger = _logger.getLogger();

        var telNumber = conversation.properties().Mobile;
        var accNumber = conversation.properties().accountNumber;
        var smpStartTs = conversation.properties().sysDate;
        var lscodevalid = /^(3)[0-9]{8}$/;
        var lscodevalid1 = /^(2)[0-9]{8}$/;
        var lscodevalid2 = /^(404)[1-9][0-9]*$/;

        let transitionAction = 'directtoagent';
        let retry = 0;
        const maxRetry = 3;

        var SmpStatusCheckAndTakeAction = (smpStatus, accNumber, telNumber, smpStartTs, lscodevalid, lscodevalid1, lscodevalid2, smpSpielMarker) => {
            const smpStatusCollection = require('../../data/bsmpchecker-data.json');

            var smpItemFound = smpStatusCollection.smpValues.find(item => item.smpStatus === smpStatus)
            if (!smpItemFound) {
                smpItemFound = { "smpStatus": "NOT_FOUND" };
            }
            var transitionAction = "createft";

            if (smpStatus === smpItemFound.smpStatus) {
                UpdateRedirectTypeAndReturnSpiel(accNumber, telNumber, smpStartTs, smpSpielMarker, transitionAction);
                SetValues(smpItemFound, smpStatus, telNumber);
            }
            else if (smpStatus.match(lscodevalid)) {
                UpdateRedirectTypeAndReturnSpiel(accNumber, telNumber, smpStartTs, smpSpielMarker, transitionAction);
                SetValues(smpStatusCollection.lscodevalid, smpStatus, telNumber);
            }
            else if (smpStatus.match(lscodevalid1)) {
                UpdateRedirectTypeAndReturnSpiel(accNumber, telNumber, smpStartTs, smpSpielMarker, transitionAction);
                SetValues(smpStatusCollection.lscodevalid1, smpStatus, telNumber);
            }
            else if (smpStatus.match(lscodevalid2)) {
                UpdateRedirectTypeAndReturnSpiel(accNumber, telNumber, smpStartTs, smpSpielMarker, transitionAction);
                SetValues(smpStatusCollection.lscodevalid2, smpStatus, telNumber);
            }
            else {
                transitionAction = "directtoagent";
                UpdateRedirectTypeAndReturnSpiel(accNumber, telNumber, smpStartTs, smpSpielMarker, transitionAction);
                conversation.variable('LScode', smpStatus);
            }

            return transitionAction;
        }

        var SetValues = (values, smpStatus, telNumber) => {
            conversation.variable('desc', values.desc.replace("{{smpStatus}}", smpStatus));
            conversation.variable('fault_type', values.fault_type);
            conversation.variable('prom_cause', values.prom_cause);
            conversation.variable('reported_by', values.reported_by);
            conversation.variable('empe_id', values.empe_id);
            conversation.variable('prom_worg_name', values.prom_worg_name);
            conversation.variable('prom_sub_type', values.prom_sub_type);
            conversation.variable('prom_category', values.prom_category);
            conversation.variable('prom_sub_category', values.prom_sub_category);
            conversation.variable('LScode', smpStatus);
            conversation.variable('telnumber', telNumber);
        }

        var UpdateRedirectTypeAndReturnSpiel = (accNumberinit, telNumberinit, smpStartTsinit, smpSpielMarker, smpRedirectTypeinit) => {
            logger.info(`[UPDATE REDIRECT TYPE AND RETURN SPIEL REQUEST] ---------------------------------------------------------------------------------------------`);
            var data1 = { "AccountNumber": accNumberinit, "TelephoneNumber": telNumberinit, "smpTS": smpStartTsinit, "smpSpielMarker": smpSpielMarker, "smpRedirectType": smpRedirectTypeinit };
            var options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data1),
            };
            logger.info(`[UPDATE REDIRECT TYPE AND RETURN SPIEL REQUEST OPTION] ${JSON.stringify(options)}`);
            fetch(globalProp.BSMPChecker.API.UpdateRedirectTypeAndSpielReturn, options).then((response) => {
                if (response.status > 200) {
                    logger.error(`[UPDATE REDIRECT TYPE AND RETURN SPIEL ERROR] ${response.statusText}`);
                } else {
                    logger.info(`[UPDATE REDIRECT TYPE AND RETURN SPIEL RESPONSE] ${JSON.stringify(response)}`);
                }
            }).catch((error) => {
                logger.error(`[UPDATE REDIRECT TYPE AND RETURN SPIEL ERROR] ${error}`);
            });
        }

        logger.start = () => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] BSMP Checker                                                                                      -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        }

        logger.end = () => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] BSMP Checker                                                                                        -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            conversation.transition(transitionAction);
            done();
            _logger.shutdown();
        }

        logger.addContext("serviceNumber", telNumber)

        logger.start();

        var Process = () => {
            logger.info(`[RETRY] Counter : ${retry}`);
            const options = globalProp.BSMPChecker.API.GetOptions(telNumber, smpStartTs);
            logger.info(`[REQUEST OPTION] ${JSON.stringify(options)}`);
            request(options, function (error, response) {
                if (error) {
                    logger.error(`[ERROR] ${JSON.stringify(error)}`);
                    retry++;
                    if (retry < maxRetry) {
                        Process();
                    }
                    else {
                        UpdateRedirectTypeAndReturnSpiel(accNumber, telNumber, smpStartTs, "API ERROR", "directtoagent");
                        transitionAction = 'directtoagent';
                        logger.end();
                    }
                }
                else {
                    if (response.statusCode > 200) {
                        if (response.statusCode === 504) {
                            retry++;
                            if (retry < maxRetry) {
                                Process();
                            }
                            else {
                                UpdateRedirectTypeAndReturnSpiel(accNumber, telNumber, smpStartTs, "DB TIMEOUT", "directtoagent");
                                transitionAction = 'directtoagent';
                                logger.end();
                            }
                        }
                        else {
                            logger.error(`[ERROR] ${JSON.stringify(response.body)}`);
                            UpdateRedirectTypeAndReturnSpiel(accNumber, telNumber, smpStartTs, "DB TIMEOUT", "directtoagent");
                            transitionAction = 'directtoagent';
                            logger.end();
                        }
                    }
                    else {
                        try {
                            var returnedValue = JSON.parse(response.body);
                            logger.info(`[SMP COUNTER] ${response.body}`);

                            let smpStatus = returnedValue.smpStatus;
                            if (!smpStatus || smpStatus === " ") smpStatus = "INVALID";

                            const smpCounter = returnedValue.smpCounter;
                            const smpReturnSpiel = returnedValue.smpReturnSpiel;
                            const smpSpielMarker = returnedValue.smpSpielMarker;

                            logger.info(`[SMP COUNTER] ${smpCounter}`);
                            logger.info(`[SMP RETURN SPIEL] ${smpReturnSpiel}`);
                            logger.info(`[SMP SPIEL MAKER] ${smpSpielMarker}`);

                            logger.info(`[SMP STATUS] ${smpStatus}`);
                            if (smpStatus === "NODATA" || smpStatus === "INVALID") {
                                logger.info(`[Return Spiel] ${smpReturnSpiel}`);
                                logger.info(`[Spiel Marker] ${smpSpielMarker}`);
                                if (smpReturnSpiel == "SPIEL3" && smpSpielMarker != 'SpielReturn3') {
                                    UpdateRedirectTypeAndReturnSpiel(accNumber, telNumber, smpStartTs, "SpielReturn3", "directtoagent");

                                    logger.info(`[COUNTER] Counter is between 30 and 45 : ${smpCounter}`);

                                    conversation.variable('smpReturnSpiel', "directing to agent.");
                                    conversation.variable('smpReturnCounter', smpCounter.toString());
                                } else {
                                    logger.info(`[COUNTER] Counter is not included in the if statements : ${smpCounter}`);
                                    conversation.variable('smpReturnCounter', smpCounter.toString());
                                }
                                transitionAction = "directtoagent";
                            } else {
                                conversation.variable('lscode', smpStatus);
                                transitionAction = SmpStatusCheckAndTakeAction(smpStatus, accNumber, telNumber, smpStartTs, lscodevalid, lscodevalid1, lscodevalid2, "SmpChecking");
                            }
                        }
                        catch (e) {
                            UpdateRedirectTypeAndReturnSpiel(accNumber, telNumber, smpStartTs, "API ERROR", "directtoagent");
                            transitionAction = 'directtoagent';
                            logger.error(`[ERROR] ${e}`)
                        }
                        logger.end();
                    }
                }
            });
        }
        Process();
    }
};



