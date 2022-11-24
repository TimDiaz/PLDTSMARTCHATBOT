"use strict";

const componentName = require('../../configurations/component_config');
const { Logger } = require('../../helpers/globalProperties');
module.exports = {
    metadata: () => ({
        name: componentName.ESWUP.GetDownTime,
        properties: {
            serviceNumber: {
                type: "string",
                required: true
            }
        },
        supportedActions: [
            'Confirmed_LandlineAndInternet', 
            'Confirmed_Landline',
            'Confirmed_Internet',
            'Trending_LandlineAndInternet',
            'Trending_Landline',
            'Trending_Internet',
            'directtoagent']
    }),

    invoke: (conversation, done) => {

        // #region Setup Properties  
        const serviceNumber = conversation.properties().serviceNumber;
        // #endregion

        // #region Imports
        const request = require('request');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.ESWUP.GetDownTime);
        const logger = _logger.getLogger();

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] ESWUP - Get Down Time                                                                             -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition] ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] ESWUP - Get Down Time                                                                               -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();

            conversation.transition(transition);
            done();
        });

        let transition = 'directtoagent';

        logger.addContext("serviceNumber", serviceNumber);
        // #endregion

        logger.start();

        let SetValues = (values) => {
            conversation.variable('desc', values.desc);
            conversation.variable('fault_type', values.fault_type);
            conversation.variable('prom_cause', values.prom_cause);
            conversation.variable('reported_by', values.reported_by);
            conversation.variable('empe_id', values.empe_id);
            conversation.variable('prom_worg_name', values.prom_worg_name);
            conversation.variable('prom_sub_type', values.prom_sub_type);
            conversation.variable('prom_category', values.prom_category);
            conversation.variable('prom_sub_category', values.prom_sub_category);
        }

        let FindESWUPValues = (eswup, type) => {
            const ESWUPCollection = require('../../data/eswupchecker-data.json');

            var itemFound = ESWUPCollection.find(item => item.eswup.toUpperCase() === eswup.toUpperCase())
            if (!itemFound) {
                itemFound = { "eswup": "NOT_FOUND" };
            }

            logger.debug(`[ESWUP] ${eswup.toUpperCase()}`);
            logger.debug(`[ITEM FOUND] ${JSON.stringify(itemFound)}`);
            
            if (eswup.toUpperCase() === itemFound.eswup.toUpperCase()) {
                SetValues(itemFound);
            }

            return `${type}_${eswup.split(" ").reduce((s,c)=> s + (c.charAt(0).toUpperCase() + c.slice(1)))}`;
        }

        let getDownTime = (token) => {
            const svcNumber = serviceNumber.length > 9? serviceNumber.substring(1, serviceNumber.length): serviceNumber;
            const options = globalProp.ESWUP.API.GetDownTime.GetOptions(svcNumber, token);
            logger.debug(`Setting up the post option: ${JSON.stringify(options)}`);
            logger.info(`Starting to invoke the request.`)
            request(options, function (error, response) {
                if (error) {
                    logger.error(`[ERROR] ${error}`);
                    transition = 'directtoagent';
                    logger.end();
                }
                else {
                    if (response.statusCode > 200) {
                        logger.error(`[ERROR] ${response.body}`);
                        transition = 'directtoagent';
                    }
                    else {
                        logger.debug(`[Response Body] ${response.body}`);

                        let responseBody;
                        if(typeof(response.body)== "string")
                            responseBody = JSON.parse(response.body)                        
                        else
                            responseBody = response.body                        

                        const result = responseBody[0];     
                        
                        logger.debug(`[Effective FROM] ${result.EffectiveFrom}`);
                        logger.debug(`[Effective FROM] ${result.EffectiveTo}`);

                        const dateFrom = Date.parse(result.EffectiveFrom);
                        const dateTo = Date.parse(result.EffectiveTo);
                        const date = Date.now();

                        if(date >= dateFrom && date <= dateTo){
                            transition = FindESWUPValues(result.Downtime, result.Type)
                        }
                        else{
                            transition = 'directtoagent'
                        }
                    }
                    logger.end();
                }
            });
        }

        const tokenOptions = globalProp.ESWUP.API.Token.PostOptions();
        logger.debug(`Setting up the token post option: ${JSON.stringify(tokenOptions)}`);
        logger.info(`Starting to invoke the token request.`)
        request(tokenOptions, function (errorToken, responseToken) {
            if (errorToken) {
                logger.error(`[ERROR] ${errorToken}`);
                transition = 'directtoagent';
                logger.end();
            }
            else {
                if (responseToken.statusCode > 200) {
                    logger.error(`[ERROR] ${responseToken.body}`);
                    transition = 'directtoagent';
                    logger.end();
                }
                else {
                    var respBody = responseToken.body;
                    var JSONRes = JSON.parse(respBody);

                    logger.debug(`[Response Body] ${respBody}`); 
                    getDownTime(JSONRes.access_token);
                }
            }
        });
    }
};