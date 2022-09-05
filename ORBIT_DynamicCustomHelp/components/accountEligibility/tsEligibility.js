"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
            name: componentName.TSEligibility,
            properties: {
				serviceNumber: {
                    type: "string",
                    required: true
                }
            },
            supportedActions: ['undertreatment', 'withOpenParent', 'withOpenParentVC', 'withOpenParentCR', 'withOpenChildTicket', 'withOpenIndTicket', 'openorder', 'eligible', 'openSo', 'notRBG', 'failure', 'invalidServiceNum']
    }),

    invoke: (conversation, done) => {
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        const _logger = instance.logger(globalProp.Logger.Category.AccountEligibility);
        const logger = _logger.getLogger();
        const _emailLog = instance.logger(globalProp.Logger.Category.Mailer);        
        const emailLog = _emailLog.getLogger();

        function logError(result, resultCode){
            const strResult = JSON.stringify(result);
            emailLog.addContext("apierrorcode", strResult);
            emailLog.addContext("apierrormsg", resultCode);
            const message = globalProp.Email.EmailFormat(globalProp.AccountEligibility.API.Name, resultCode, strResult, serviceNumber);

            logger.error(`[ERROR CODE: ${resultCode}] ${strResult}`)
            emailLog.error(message);
        }

        let transition = 'failure';

		var serviceNumber = conversation.properties().serviceNumber;
	    logger.addContext("serviceNumber", serviceNumber);
        emailLog.addContext("subject", globalProp.Email.Subjects.AccountEligibility);
        emailLog.addContext("apiUrl", globalProp.Logger.BCPLogging.URL);
        emailLog.addContext("apiname", globalProp.Logger.BCPLogging.AppNames.AccountEligibility.TSEligibility);
        emailLog.addContext("usertelephonenumber", serviceNumber);
        emailLog.addContext("useraccountnumber", '');

        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        logger.info(`- [START] Account Eligibility                                                                               -`)
        logger.info(`-------------------------------------------------------------------------------------------------------------`)

        const options = globalProp.AccountEligibility.API.GetOptions(serviceNumber);
        logger.debug(`Setting up the get option: ${JSON.stringify(options)}`);

        logger.info(`Starting to invoke the request.`)  
        request(options, function (error, response) {
            if (error) {
                logError(error, error.code);
                transition = 'failure';  
            }
            else{
                var respBody = response.body;
                var JSONRes = JSON.parse(respBody);
                var underTreatmentmsg = "Under Treatment.";
                var openTicketmsg = "With Open Repair Ticket.";
                var invalidservice = "Invalid service number";
                var openSOmsg = "With Open SO.";
                var openTransfermsg = "With Open Transfer SO.";
                var rbg = "Account is not RBG.";
            
                if(response.statusCode > 200)
                {
                    logError(response.body, response.statusCode);
                    transition = 'failure'; 

                    switch(response.statusCode){
                        case 500:
                            logger.error(`[ERROR CODE: ${response.statusCode}] Internal Server Error Ecountered, Please try a different account.`);
                            break;
                        case 408:
                            logger.error(`[ERROR CODE: ${response.statusCode}] Request Time out, Please try again later.`);
                            break;
                        case 502:
                            logger.error(`[ERROR CODE: ${response.statusCode}] Bad Gateway Error, Please try again later.`);
                            break;
                        case 599:
                            logger.error(`[ERROR CODE: ${response.statusCode}] Network Connect Timeout Error, Please try again later.`);
                            break;
                        default:
                            logger.error(`[ERROR CODE: ${response.statusCode}] OOPS, Error Happened! Contact Administrator..`);
                            break;
                    }
                }
                else{
                    if (JSONRes.eligible === false) {
                        const message = JSONRes.message.toString();
                        const str = JSONRes.spiel.toString();

                        if (message === underTreatmentmsg) {
                            logger.debug(`[Response Message]: ${underTreatmentmsg}`);
                            logger.debug(`[Spiel]: ${str}`);

                            conversation.variable('ineligibleAcctmsg', str);
                            transition = 'undertreatment';
                        }
                        else if (message === rbg) {
                            logger.debug(`[Response Message]: ${rbg}`);
                            logger.debug(`[Spiel]: ${str}`);

                            conversation.variable('ineligibleAcctmsg', str);
                            transition = 'notRBG';
                        }
                        else if (message === openTicketmsg) {
                            logger.debug(`[Response Message]: ${openTicketmsg}`);
                            logger.debug(`[Spiel]: ${str}`);
                            
                            var tickmatch = str.match(/\d+/);
                            var ticketNum = tickmatch[0];
                            var ticketTier = str.match(/(PARENT|CHILD)/g);
                            var ticketType = str.match(/(VOLUME COMPLAINT|CR|TT|SQDT|PDT)/g);
                            var promWorgSpiel = "";

                            logger.debug(`value of ticket tier:  [${ticketTier}].`);
                            logger.debug(`value of ticket type:  [${ticketType}].`);
                            logger.debug(`value of ticket number:  [${ticketNum}].`);
                            
                            if (ticketTier == "PARENT") {
                                if (ticketType == "VOLUME COMPLAINT"){
                                    conversation.variable('ticketNumber', ticketNum);
                                    conversation.variable('ParentType', ticketType.toString());
                                    transition = 'withOpenParentVC';
                                }else if (ticketType.includes('CR')) {
                                    conversation.variable('ticketNumber', ticketNum);
                                    conversation.variable('ParentType', ticketType.toString());
                                    transition = 'withOpenParentCR';
                                }else{
                                    conversation.variable('ticketNumber', ticketNum);
                                    conversation.variable('ParentType', ticketType.toString());
                                    transition = 'withOpenParent';
                                }
                            } 
                            else if (ticketTier == "CHILD") {
                                conversation.variable('ticketNumber', ticketNum);
                                transition = 'withOpenChildTicket';
                            }
                            else {
                                if (str.match(/(VAS SUPPORT|SUB_HOMECARE|HOME-HELD|HOME-FLM|HOME OUTBOUND|HOME CARE|FLM-TOKUNDEROB|FLM-TOKNOANSWER|DEVIATED-TELEPERFORM|DEVIATED-STERLING|DEVIATED-INFOCOM|CONVERGED STORE|CKL_HOMECARE|CCARE|STORE)/g)){
                                    promWorgSpiel = "Our restoration team is conducting initial diagnosis and troubleshooting for your repair ticket number "+ ticketNum +". We have made a follow-up and will give you an update via SMS in 48 hours.\n\nTo track the status of your ticket, please visit https://pldthome.com/pldt-tracker, or text PLDTTRACK to 8171 for Smart and TNT for free; or 0970 0000 171 for other networks. Thank you.";
                                    conversation.variable('indiTicketSpiel', promWorgSpiel);

                                }else if (str.match(/(TECHRES-FRD|TECHRES-UNDEROB|TECHRES-CONFIRM-CLOSE|TECH-RESOLUTION|TECHRES-IPTV)/g)) {
                                    promWorgSpiel = "Our restoration team is conducting testing for your repair ticket number. We will give you an update within 24 hours.\n\nTo track the status of your ticket, please visit https://pldthome.com/pldt-tracker, send us a message at https://m.me/PLDTHome or text PLDTTRACK to 8171 for Smart and TNT for free; or 0970 0000 171 for other networks. Thank you.";
                                    conversation.variable('indiTicketSpiel', promWorgSpiel);

                                }else if (str.match(/(BAT_OPSIM|BCD_OPSIM|BGO_OPSIM|BICOL_OPSIM|C.VALLEY_OPSIM|CAI_OPSIM|CAMANAVA_OPSIM|CEBU_OPSIM|CVE_OPSIM|DAVAO_OPSIM|DGP_OPSIM|GEN SAN_OPSIM|ILOCOS_OPSIM|LAGUNA_OPSIM|LEYTE_OPSIM|MARATEL_OPSIM|MIG_OPSIM|MKT_OPSIM|MLL_OPSIM|MRN_OPSIM|MYG_OPSIM|NOMLA_OPSIM|NQC_OPSIM|PANAY_OPSIM|PASIG_OPSIM|PBZ_OPSIM|PHILCOM_OPSIM|PSALM_OPSIM|PSY-PRQ_OPSIM|QUEZON_OPSIM|SBI_OPSIM|SFP_OPSIM|SOMLA_OPSIM|SQC_OPSIM|SUB_OPSIM|TRC-NE_OPSIM|ZAMBO_OPSIM|CKL_OPSIM|SAMAR-LEYTE_OPSIM|PLDT PHILCOM_OPSIM|APMS-DISPATCH|OFSC-DISPATCH|SMR-LYT-BOH_OPSIM|SOUTH CEBU_OPSIM|NORTH CEBU_OPSIM)/g)) {
                                    promWorgSpiel = "Your repair request number "+ ticketNum +" is now dispatched to our field operations team. Our technician will visit your premises, if needed. Please be reminded that our technician is not authorized to receive payment during repair. You may report issues encountered with our technician thru https://pldthome.info/technicianreports. I will also log a follow up to this ticket on your behalf and we will provide updates on the progress of this request thru SMS.\n\nTo track the status of your ticket, please visit https://pldthome.com/pldt-tracker or text PLDTTRACK to 8171 for Smart and TNT for free; or 0970 0000 171 for other networks. Thank you.";
                                    conversation.variable('indiTicketSpiel', promWorgSpiel);

                                }else if (str.match(/(BZ-MCT|BZ-MIGRATION|BZ-PREMIGRATION|BZ-PREV-MTCE|CLRMD-MNFC|CLRMD-MNFC-CLOSE|CLRMV-MNFC|FSMG|NETRES|NETRES-ACCESS|NETRES-CORE|NETRES-DATA-SHD|NETRESD-FR-1|NETRESD-FR-2|NETRESD-FR-3|NETRESD-FR-4|NETRESD-FR-5|NETRESD-NR-1|NETRESD-NR-2|NETRESD-NR-3|NETRESD-NR-4|NETRESD-NR-5|NETRES-TRANSPORT|NETRES-VOICE|NETRES-VOICE-SHD|NETWORK MIGRATION|SDM|SDM FALLOUT-HOME|NETWORK_FFS_PPM|NETWORK_BUILD-PM|NETWORK_ACCESS-ENGG|BUILD_OPPM_GMM|BUILD_OPPM_VISMIN|BUILD_OPPM_LUZON|NETRES-DATA|NETRES-HD|NET_ACCESS_PLANNING|NETWORK_ACCESS_ENGG)/g)) {
                                    promWorgSpiel = "Our network engineers are conducting further testing and diagnosis for your repair ticket number. We will give you an update within 24 hours.\n\nTo track the status of your ticket, please visit https://pldthome.com/pldt-tracker, send us a message at https://m.me/PLDTHome or text PLDTTRACK to 8171 for Smart and TNT for free; or 0970 0000 171 for other networks. Thank you.";
                                    conversation.variable('indiTicketSpiel', promWorgSpiel);

                                }else if (str.match(/(FM_POLL)/g)) {
                                    promWorgSpiel = "Your ticket number has been resolved and service has been restored. Please call 171 within 48 hours if the issue persists. Otherwise, the ticket will be closed. Thank you.";
                                    conversation.variable('indiTicketSpiel', promWorgSpiel);

                                } else {
                                    promWorgSpiel = "Our restoration team is conducting testing for your repair ticket number "+ ticketNum +".\n\nTo track the status of your ticket, please visit https://pldthome.com/pldt-tracker or text PLDTTRACK to 8171 for Smart and TNT for free; or 0970 0000 171 for other networks. Thank you.";
                                    conversation.variable('indiTicketSpiel', promWorgSpiel);

                                }
                                conversation.variable('ticketNumber', ticketNum);
                                transition = 'withOpenIndTicket';
                            }
                        }
                        else if (message === openSOmsg) {
                            logger.debug(`[Response Message]: ${openSOmsg}`);
                            logger.debug(`[Spiel]: ${str}`);
                            
                            if (str.match(/\d+/g)) {
                                console.log(str.split(/([0-9]+)/));
                                var soMatches = str.split(/([0-9]+)/);
                                var soNum = soMatches[1];
                                conversation.variable('openSONumber', soNum);
                            }
                            else
                                conversation.variable('openSONumber', "undefined");

                            conversation.variable('ineligibleAcctmsg', str);
                            transition = 'openSo';
                        }
                        else if (message === openTransfermsg) {
                            logger.debug(`[Response Message]: ${openTransfermsg}`);
                            logger.debug(`[Spiel]: ${str}`);

                            var matches = str.match(/\d+/); //(/(\d+)/)
                            conversation.variable('openSONumber', matches);
                            conversation.variable('ineligibleAcctmsg', str);
                            transition = 'openSo';
                        }
                        else if (message === invalidservice) {
                            logger.debug(`[Message]: Invalid Service Number`);
                            transition = 'invalidServiceNum';
                        }
                        else {
                            logger.debug(`[Spiel]: ${str}`);

                            var matches = str.match(/\d+/); //(/(\d+)/)
                            conversation.variable('openSONumber', matches);
                            conversation.variable('ineligibleAcctmsg', str);
                            transition = 'openorder';
                        }
                    }
                    else {
                        transition = 'eligible';
                        conversation.keepTurn(true);
                    }
                }
            }
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Account Eligibility                                                                                 -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();
            _emailLog.shutdown();

            conversation.transition(transition);
            done();
        });
    }
};