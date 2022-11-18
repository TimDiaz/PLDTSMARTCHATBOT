"use strict";

const { stringify } = require('querystring');
const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.Serviceability,
        properties: {
            latitude: {
                type: "string",
                required: true
            },
            longitude: {
                type: "string",
                required: true
            },
            inBuilding: {
                type: "string",
                required: false
            },
            serviceNumber: {
                type: "string",
                required: true
            }
        },
        supportedActions: ['FIBR', 'DSL', 'FACCHECK', 'WIRELESS', 'GENERIC', 'failure']
    }),

    invoke: (conversation, done) => {

        var WHITELISTED = "FALSE";
        var LATITUDE = conversation.properties().latitude;
        var LONGITUDE = conversation.properties().longitude;
        var BUILDING = conversation.properties().inBuilding;
        var HIGHERPACKAGEFLAG = "TRUE";
        var serviceNumber = conversation.properties().serviceNumber;

        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        const _logger = instance.logger(globalProp.Logger.Category.Serviceability);
        const logger = _logger.getLogger();

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] Serviceability                                                                                    -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] Serviceability                                                                                      -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();

            conversation.transition(transition);
            done();
        });

        let transition = 'failure';
        let inBldg = '';

        logger.addContext("serviceNumber", serviceNumber);
        logger.start();

        logger.debug(`[BUILDING] ${BUILDING.toString()}`);
        if (BUILDING.toString() == 'TRUE') {
            logger.debug('BUILDING PARAMETER IS TRUE');
            inBldg = BUILDING.toString();
        }
        else {
            logger.debug('BUILDING PARAMETER IS FALSE');
        }

        const requestBody = JSON.stringify({
            "WHITELISTED": WHITELISTED.toString(),
            "LATITUDE": LATITUDE.toString(),
            "LONGITUDE": LONGITUDE.toString(),
            "HIGHERPACKAGEFLAG": HIGHERPACKAGEFLAG.toString(),
            "CONSUMER": globalProp.Serviceability.API.Consumer,
            "TOKEN": globalProp.Serviceability.API.Token,
            "BUILDING": inBldg
        });
        logger.debug(`Setting up the request body: ${requestBody}`);

        const options = globalProp.Serviceability.API.PostOptions(requestBody);
        logger.debug(`Setting up the post option: ${JSON.stringify(options)}`);

        logger.info(`Starting to invoke the request.`)

        request(options, (error, response) => {
            if (error) {
                logger.error(`[ERROR] ${error}`)
            }
            else {
                if (response.statusCode > 200) {
                    logger.error(`[ERROR] ${response.body}`);
                    transition = 'GENERIC';
                }
                else {
                    var createRes = response.body;
                    var JSONRes = JSON.parse(createRes);
                    var TermStr = JSONRes.PARAM1; //from TERMINALS to PARAM1 07232020
                    var StrRes = JSON.stringify(TermStr);
                    logger.debug(`[PARAM1] ${StrRes}`);

                    var fttx = /FTTX/i;
                    var fttxp = /FTTX_P/i;
                    var vdsl = /VDSL/i;
                    if (TermStr != '') {
                        if (StrRes.match(fttx) || StrRes.match(vdsl) || StrRes.match(fttxp)) {
                            logger.debug('The FTTX in the Terminals');
                            conversation.variable('outplans', "Good news! Your area is now PLDT Fibr-ready. Live life at full speed with our fastest Fibr plans. Visit https://pldthome.com/fibr to apply. Facility availability is still subject to validation and will depend on the actual checking of your exact address. Thank you.");
                            transition = 'FIBR';
                        }
                        else {

                            if (StrRes.includes('NGN')) {
                                logger.debug('NGN return in the Terminals');
                                conversation.variable('outplans', "We need to check further the available facilities in your area to serve you. Please visit https://pldthome.com/fibr to apply so our team can verify.");
                                transition = 'DSL';
                            }
                            else if (StrRes.includes('FD LTE')) {
                                logger.debug('FD LTE return in the Terminals');
                                conversation.variable('outplans', "We need to check further the available facilities in your area to serve you. Please visit https://pldthome.com/fibr to apply so our team can verify.");
                                transition = 'WIRELESS';
                            }
                            else if (StrRes.includes('TD LTE')) {
                                logger.debug('TD LTE return in the Terminals');
                                conversation.variable('outplans', "We need to check further the available facilities in your area to serve you. Please visit https://pldthome.com/fibr to apply so our team can verify.");
                                transition = 'WIRELESS';
                            }
                            else if (StrRes.includes('WIRELESS')) {
                                logger.debug('TD LTE return in the Terminals');
                                conversation.variable('outplans', "We need to check further the available facilities in your area to serve you. Please visit https://pldthome.com/fibr to apply so our team can verify.");
                                transition = 'WIRELESS';
                            }
                            else {
                                logger.debug('Generic Spiel');
                                conversation.variable('outplans', "There is no available PLDT Home facility near your selected address at the moment. You may visit https://pldthome.com to know more about our latest products and services.");
                                transition = 'GENERIC';
                            }
                        }
                    }
                }
            }
            logger.end();
        })
    }
};
