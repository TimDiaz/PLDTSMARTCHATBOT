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
        // #region Setup Properties 
        var telNumber = conversation.properties().Mobile;
        var accNumber = conversation.properties().accountNumber;
        var smpStartTs = conversation.properties().sysDate;
        // #endregion

        // #region Imports
        var request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.BSMP.BSMPChecker);
        const logger = _logger.getLogger();
        const fetch = require('node-fetch');

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] SMP Checker                                                                                       -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] SMP Checker                                                                                         -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            conversation.transition(transition);
            logger.debug(transition);
            _logger.shutdown();

            done();
        });

        let transition = "failure";
        var lscodevalid = /^(3)[0-9]{8}$/;
        var lscodevalid1 = /^(2)[0-9]{8}$/;
        var lscodevalid2 = /^(404)[1-9][0-9]*$/;

        logger.addContext("serviceNumber", telNumber);

        function UpdateRedirectType(aaccNumberinit, telNumberinit, smpStartTsinit, smpRedirectTypeinit) {
            var data1 = { "AccountNumber": aaccNumberinit, "TelephoneNumber": telNumberinit, "smpTS": smpStartTsinit, "smpRedirectType": smpRedirectTypeinit };
            var options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data1),
            };

            fetch(globalProp.BSMPChecker.API.UpdateRedirectTypeUrl, options); //tim 05052022 changed to smart domain
        }

        function UpdateReturnSpiel(aaccNumberinit, telNumberinit, smpStartTsinit, smpSpielMarker) {
            var data1 = { "AccountNumber": aaccNumberinit, "TelephoneNumber": telNumberinit, "smpTS": smpStartTsinit, "smpSpielMarker": smpSpielMarker };
            var options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data1),
            };

            fetch(globalProp.BSMPChecker.API.UpdateReturnSpielUrl, options); //tim 05052022 changed to smart domain
        }

        // #endregion

        logger.start();

        var options = globalProp.BSMPChecker.API.GetOptions(telNumber, smpStartTs);
        logger.info(`Service Number: [${telNumber}]`)
        logger.info("request: " + options);
        request(options, function (error, response) {
            // if (error) throw new Error(error);
            if (error) {
                console.log("directtoagent autoroute due to API gateway down:  " + error);
                logger.debug("directtoagent autoroute due to API gateway down:  " + error);
                transition = 'directtoagent';
                logger.end();
            }
            else {
                if (response.statusCode > 200) {
                    transition = 'directtoagent';
                    logger.debug("1234 " + response.statusCode);
                    logger.debug(transition);
                    logger.end();
                }
                else {

                    var returnedValue = JSON.parse(response.body);
                    var smpStatus = returnedValue['smpStatus'].toString();
                    var smpCounter = parseInt(returnedValue['smpCounter']);
                    var smpReturnSpiel = returnedValue['smpReturnSpiel'].toString();
                    var smpSpielMarker = returnedValue['smpSpielMarker'].toString();
                    logger.debug(smpStatus);
                    if (JSON.stringify(returnedValue) == null || JSON.stringify(returnedValue) == 'undefined') {
                        console.log("this is the error: " + error);
                        //conversation.transition('serverdown');
                        transition = 'serverdown';
                        //done();
                    }
                    setTimeout(() => {
                        if (smpStatus === "NODATA") {
                            console.log(smpReturnSpiel + " | " + smpSpielMarker);
                            logger.debug("NODATA");
                            if (smpReturnSpiel == "SPIEL3" && smpSpielMarker != 'SpielReturn3') {
                                UpdateReturnSpiel(accNumber, telNumber, smpStartTs, "SpielReturn3");
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "directtoagent");
                                console.log("counter is between 30 and 45 :" + smpCounter.toString());
                                conversation.variable('smpReturnSpiel', "directing to agent.");
                                conversation.variable('smpReturnCounter', smpCounter.toString());
                                //conversation.transition('directtoagent');
                                //done();
                                logger.debug("counter is between 30 and 45 :" + smpCounter.toString());
                                transition = 'directtoagent';
                            } else {
                                console.log("else counter is not inside the if statements: " + smpCounter.toString());
                                conversation.variable('smpReturnCounter', smpCounter.toString());
                                //conversation.transition('nodata3');
                                //done();
                                logger.debug("else counter is not inside the if statements: " + smpCounter.toString());
                                transition = 'nodata3';
                            }
                        } else if (smpStatus != "NODATA") { // add status completed for extra validation
                            console.log("show data");
                            logger.debug("show data");
                            conversation.variable('lscode', smpStatus);
                            if (smpStatus == "232") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MISSING MICRO-FILTER_UNBALANCED WIRING-IN [LSCODE: 232]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "SPLITTER/MICROFILTER - DEFECTIVE");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';

                            }
                            else if (smpStatus == "2132") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MISSING MICRO-FILTER_UNBALANCED WIRING-IN_BAD SPLICES [LSCODE: 2132]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "Could not find the physical address for lineId 0538320051") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MISSING MICRO-FILTER_UNBALANCED WIRING-IN_BAD SPLICES [LSCODE: 2132]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                logger.debug("LS_CODE:" + smpStatus);
                                transition = 'createft';
                                console.log("test1234" + smpStatus);
                                //console.log(transition);
                            }
                            else if (smpStatus == "10151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_FAULT CLOSE TO THE DSLAM[LSCODE: 10151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "30151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_FAULT LOCATED IN THE OUTSIDE PLANTS [LSCODE: 30151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "209040501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "FIBER CUT_Fault Located-Feeder_OLT-LCP [LSCODE: 209040501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - PRIMARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - OLT TO LCP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "209020501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "SEVERELY DEGRADED FOC_Fault Located-feeder_OLT-LCP [LSCODE: 209020501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-SLOW BROWSING");
                                conversation.variable('prom_category', "NETWORK - PRIMARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - OLT TO LCP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "209030501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Fault Located-feeder_OLT-LCP (Mild Connection Issue) [LSCODE: 209030501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-SLOW BROWSING");
                                conversation.variable('prom_category', "NETWORK - PRIMARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - OLT TO LCP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "209040105") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OOS_FIBER CUT_Fault Located-feeder_OLT-LCP [LSCODE: 209040105]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - PRIMARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - OLT TO LCP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "209020105") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OOS_SEVERELY DEGRADED FOC_Fault Located-feeder_OLT-LCP[LSCODE: 209020105]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - PRIMARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - OLT TO LCP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "209030105") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OOS_Fault Located-feeder_OLT-LCP (Mild Conn Issue) [LSCODE: 209030105]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - PRIMARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - OLT TO LCP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "309040501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "FIBER CUT_Fault Located-Collector_LCP-NAP [LSCODE: 309040501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - SECONDARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - LCP TO NAP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "309020501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "SEVERELY DEGRADED FOC_Fault Located-Collector_LCP-NAP[LSCODE: 309020501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-SLOW BROWSING");
                                conversation.variable('prom_category', "NETWORK - SECONDARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - LCP TO NAP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "309030501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Fault Located-Collector_LCP-NAP (Mild Conn Issue) [LSCODE: 309030501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-SLOW BROWSING");
                                conversation.variable('prom_category', "NETWORK - SECONDARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - LCP TO NAP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "309040105") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OOS_FIBER CUT_Fault Located-Collector_LCP-NAP [LSCODE: 309040105]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - SECONDARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - LCP TO NAP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "309020105") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OOS_SEVERELY DEGRADED FOC_Fault Located-Collector_LCP-NAP[LSCODE:309020105]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - PRIMARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - OLT TO LCP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "309030105") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OOS_Fault Located-Collector_LCP-NAP (Mild Conn Issue) [LSCODE: 309030105]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - SECONDARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - LCP TO NAP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "909040501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "[QR]FIBER_CUT. For localization, real time diagnostics [LSCODE: 909040501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_QUARANTINE");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "");
                                conversation.variable('prom_sub_type', "");
                                conversation.variable('prom_category', "");
                                conversation.variable('prom_sub_category', "");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "2121") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "PO_BAD SPLICES_UNBALANCED WIRING-INSIDE [LSCODE: 2121]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "2151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_UNBALANCED WIRING-INSIDE [LSCODE: 2151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "3121") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "PO_BAD SPLICES [LSCODE: 3121]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "3151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES [LSCODE: 3151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "42121") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "PO_BAD SPLICES_UNBALANCED WIRING-INSIDE [LSCODE: 42121]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "42151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_UNBALANCED WIRING-INSIDE [LSCODE: 42151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "909020501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "SEVERELY DEGRADED FOC_Contaminated, air gap,poor splices[LSCODE: 909020501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED RECEIVE POWER - FIBER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "909030501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Contaminated, air gap,poor splices(Mild Conn Issue)[LSCODE: 909030501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED RECEIVE POWER - FIBER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "909090003") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Defective PON port [LSCODE: 909090003]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - OUTAGE");
                                conversation.variable('prom_sub_category', "FOUND NE ALARM");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "909090009") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OLT PON Port is Out of Service [LSCODE: 909090009]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - OUTAGE");
                                conversation.variable('prom_sub_category', "FOUND NE ALARM");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "909040105") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OOS_FIBER CUT_DISPATCH [LSCODE: 909040105]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FIBERCUT - NAP TO ONU");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "909020105") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OOS_ONU_SEVERELY DEGRADED FOC_Contaminated surface[LSCODE: 909020105]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FIBERCUT - NAP TO ONU");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "909030105") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OOS_ONU_Contaminated surface(Mild Connection Issue) [LSCODE: 909030105]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FIBERCUT - NAP TO ONU");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "909090006") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Rogue ONU [LSCODE: 909090006]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "500");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-CANNOT BROWSE");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "MODEM/ONU - DEFECTIVE/PHYSICAL SET-UP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "409040501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "FIBER CUT_Fault Located-Distribution_NAP-ONU [LSCODE: 409040501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FIBERCUT - NAP TO ONU");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "409020501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "SEVERELY DEGRADED FOC_Fault Located-Distbn_NAP-ONU[LSCODE: 409020501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED RECEIVE POWER - FIBER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "409030501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Fault Located-Distribution_NAP-ONU (Mild Conn Issue) [LSCODE: 409030501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED RECEIVE POWER - FIBER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "221") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "PO_UNBALANCED WIRING-INSIDE[LSCODE: 221]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "251") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-INSIDE [LSCODE: 251]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft';
                            }
                            else if (smpStatus == "171") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES [LSCODE: 171]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'

                            }
                            else if (smpStatus == "271") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-INSIDE [LSCODE: 271]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "371") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Line Problem Detected [LSCODE: 371]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "500");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-CANNOT BROWSE");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "3171") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES [LSCODE: 3171]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "3271") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-INSIDE [LSCODE: 3271]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "2171") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_UNBALANCED WIRING-INSIDE [LSCODE: 2171]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "12171") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_UNBALANCED WIRING-IN_FAULT CLOSE TO THE DSLAM[LSCODE: 12171]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "40271") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-INSIDE [LSCODE: 40271]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "62171") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_UNBALANCED WIRING-INSIDE [LSCODE: 62171]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "909090012") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OLT is Admin-down [LSCODE: 909090012]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - OUTAGE");
                                conversation.variable('prom_sub_category', "FOUND NE ALARM");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "60001") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Line Problem Detected [LSCODE: 60001]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "500");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-CANNOT BROWSE");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "60171") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES [LSCODE: 60171]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "10155") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_FAULT CLOSE TO THE DSLAM[LSCODE: 10155]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "40155") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES [LSCODE: 40155]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "40255") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-INSIDE [LSCODE: 40255]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "9030501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Contaminated, air gap,poor splices (Mild Conn Issue) [LSCODE: 9030501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED RECEIVE POWER - FIBER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "9020501") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "SEVERELY DEGRADED FOC_Contaminated, air gap,poor splices[LSCODE:9020501]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED RECEIVE POWER - FIBER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "10255") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-IN_FAULT IS LOCATED CLOSE TO THE DSLAM[LSCODE: 10255]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "40141") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES [LSCODE: 40141]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "3132") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MISSING MICRO-FILTER_BAD SPLICES [LSCODE: 3132]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "2") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MISSING MICRO-FILTER [LSCODE: 2]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "SPLITTER/MICROFILTER - DEFECTIVE");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES [LSCODE: 151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "409040105") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "OOS_ONU_FIBER CUT_Fault Located-Distribution_NAP-ONU [LSCODE: 409040105]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FIBERCUT - NAP TO ONU");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "121") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "PO_BAD SPLICES [LSCODE: 121]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "132") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MISSING MICRO-FILTER_BAD SPLICE [LSCODE: 132]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "321") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "PO_Line Problem Detected [LSCODE: 321]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "500");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-CANNOT BROWSE");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "332") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MISSING MICRO-FILTER [LSCODE: 332]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "SPLITTER/MICROFILTER - DEFECTIVE");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "351") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Line Problem Detected [LSCODE: 351]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "500");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-CANNOT BROWSE");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "3221") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "PO_UNBALANCED WIRING-INSIDE[LSCODE: 3221]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "3232") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MISSING MICRO-FILTER_UNBALANCED WIRING-IN [LSCODE: 3232]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "SPLITTER/MICROFILTER - DEFECTIVE");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "3251") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-INSIDE[LSCODE: 3251]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "10251") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-IN. FAULT IS LOCATED CLOSE TO THE DSLAM [LSCODE: 10251]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "12121") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "PO_BAD SPLICES_UNBALANCED WIRING-IN_FAULT CLOSE TO THE DSLAM[LSCODE: 12121]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "12151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_UNBALANCED WIRING-IN_FAULT CLOSE TO THE DSLAM[LSCODE: 12151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "13151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_FAULT CLOSE TO THE DSLAM [LSCODE: 13151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "13251") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-INSIDE [LSCODE: 13251]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "33151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_FAULT LOCATED IN THE OUTSIDE PLANTS  [LSCODE: 33151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "40151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES [LSCODE: 40151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "40251") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-INSIDE[LSCODE: 40251]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "501");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-FREQUENT DISCONNECTION");
                                conversation.variable('prom_category', "LAST MILE - INSIDE");
                                conversation.variable('prom_sub_category', "INSIDE WIRING - FAULTY - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "42132") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MISSING MICRO-FILTER_UNBALANCED WIRING AND BAD SPLICE [LSCODE: 42132]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "10121") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "PO_BAD SPLICES_FAULT CLOSE TO THE DSLAM [LSCODE: 10121]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "10132") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MISSING MICRO-FILTER_BAD SPLICE_FAULT CLOSE TO THE DSLAM [LSCODE: 10132]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "10221") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "UNBALANCED WIRING-IN.FAULT IS LOCATED CLOSE TO THE DSLAM[LSCODE: 10221]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "12132") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MICRO-FILTER_BAD SPLICE_UNBALANCED_FAULT CLOSE TO THE DSLAM[LSCODE: 12132]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "20151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES_FAULT IS LOCATED CLOSE TO THE CUST PREM [LSCODE: 20151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "30121") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "PO_BAD SPLICES_FAULT IS LOCATED IN THE OUTSIDE PREM[LSCODE: 30121]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "30132") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "MICRO-FILTER_BAD SPLICE_Fault located in the outside plant [LSCODE: 30132]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "43151") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES [LSCODE: 43151]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "40171") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "BAD SPLICES [LSCODE: 40171]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "50001") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "Line Problem Detected [LSCODE: 50001]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "500");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "D-CANNOT BROWSE");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FAILED SNR/LA/LONG LOOP - COPPER");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus.match(lscodevalid)) {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "FIBER CUT_LCP-NAP [LSCODE: " + smpStatus + "]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - SECONDARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - LCP TO NAP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus.match(lscodevalid1)) {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "FEEDER (OLT-LCP) Issue [LSCODE: " + smpStatus + "]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_NETWORK");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "NETWORK - PRIMARY");
                                conversation.variable('prom_sub_category', "FIBERCUT - OLT TO LCP");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus.match(lscodevalid2)) {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "createft");
                                conversation.variable('desc', "FIBER CUT_DISTRIBUTION (NAP-ONU) Issue [LSCODE: " + smpStatus + "]");
                                conversation.variable('fault_type', "RBG-CRT");
                                conversation.variable('prom_cause', "100");
                                conversation.variable('reported_by', "CHATBOT_LM");
                                conversation.variable('empe_id', "MOBILEIT");
                                conversation.variable('prom_worg_name', "IVRS");
                                conversation.variable('prom_sub_type', "VD-NO VOICE AND DATA");
                                conversation.variable('prom_category', "LAST MILE");
                                conversation.variable('prom_sub_category', "FIBERCUT - NAP TO ONU");
                                conversation.variable('LScode', smpStatus);
                                conversation.variable('telnumber', telNumber);
                                //conversation.transition('createft');
                                //done();
                                transition = 'createft'
                            }
                            else if (smpStatus == "null" || smpStatus == "5" || smpStatus == "1" || smpStatus == "41" || smpStatus == "909090002" || smpStatus == "13" || smpStatus == "909090010" || smpStatus == "909090205" || smpStatus == "909090007" || smpStatus == "8" || smpStatus == "4" || smpStatus == "0" || smpStatus == "909090000" || smpStatus == "909090011" || smpStatus == "909091311" || smpStatus == "60" || smpStatus == "95" || smpStatus == "909090008" || smpStatus == "409020105" || smpStatus == "409030105" || smpStatus == "909090013" || smpStatus == "909090800" || smpStatus == "909090811" || smpStatus == "60095" || smpStatus == "10095" || smpStatus == "40095" || smpStatus == "60095" || smpStatus == "50095") {
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "directtoagent");
                                conversation.variable('LScode', smpStatus);
                                //conversation.transition('directtoagent');
                                //done();
                                transition = 'directtoagent'
                            } else { //catcher for ls code: The technology associated to the line or subscriber is not supported
                                UpdateRedirectType(accNumber, telNumber, smpStartTs, "directtoagent");
                                conversation.variable('LScode', smpStatus);
                                //conversation.transition('directtoagent');
                                //done();
                                transition = 'directtoagent'
                            }
                        } else {
                            console.log("this is else from NODATA");
                            //conversation.transition('nodata3');
                            //done();
                            transition = 'nodata3'
                            logger.debug("nodata3");
                        }
                        logger.end();
                    }, 11000);
                }
            }
        });
    }

};



