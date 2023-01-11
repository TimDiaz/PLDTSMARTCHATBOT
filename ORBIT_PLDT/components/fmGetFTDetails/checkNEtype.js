"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.FMgetFTDetails.CheckNEtype,
        properties: {
            accountNumber: {
                type: "string",
                required: true
            },
            serviceNumber: {
                type: "string",
                required: true
            }
        },
        supportedActions: ['success','failure']
    }),

    invoke: (conversation, done) => {
        // #region Setup Properties  
        const accountNumber = conversation.properties().accountNumber;
        const serviceNumber = conversation.properties().serviceNumber;
        // #endregion

        // #region Imports
        const request = require('request');
        const Logic = require('../../businesslogics/fmGetFTDetails_logic').Logic;
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion

        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.FMGetFTDetail.CheckNEType);
        const logger = _logger.getLogger();

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [START] FM Get FT Details - Check NE-Type                                                                 -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });

        logger.end = (() => {
            logger.info(`[Transition] ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END] FM Get FT Details - Check NE-Type                                                                   -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)

            _logger.shutdown();

            conversation.transition(transition);
            done();
        });

        let checkNEtype = (serviceType, neType, respBody) => {
            logger.debug(`[Response Body] ${respBody}`);                    
            logger.debug(`[Service Type] ${serviceType}`)
            logger.debug(`[NE Type] ${neType}`)

            const result = logic.CheckNEType(serviceType, neType, respBody);
            transition = result.Transition;

            result.Variables.forEach(element => {
                conversation.variable(element.name, element.value);
                logger.info(`[Variable] Name: ${element.name} - Value ${element.value}`);
            });
        }

        let transition = 'failure';
        let optionType = "12"

        logger.addContext("serviceNumber", serviceNumber);

        const logic = new Logic(logger, globalProp);
        // #endregion
        
        logger.start();

        const requestBody = JSON.stringify({
            "optionType": optionType,
            "serviceId": accountNumber
        });
        logger.debug(`Setting up the request body: ${requestBody}`);

        const options = globalProp.FMGetFTDetails.API.PostOptions(requestBody);
        logger.debug(`Setting up the post option: ${JSON.stringify(options)}`);

        logger.info(`Starting to invoke the request.`)
        request(options, function (error, response) {
            if (error) {
                checkNEtype('undefined', 'undefined', error);  
            }
            else {
                if (response.statusCode > 200) {
                    checkNEtype('undefined', 'undefined', response.body);  
                }
                else {
                    let respBody = response.body;
                    let JSONRes = JSON.parse(respBody);

                    let ne_Type = 'undefined';  
                    let service_Type = 'undefined';  

                    if(JSONRes.result.SERVICE_TYPE !== undefined)
                        service_Type = JSONRes.result.SERVICE_TYPE;      

                    if(JSONRes.result.NE_TYPE !== undefined)
                        ne_Type = JSONRes.result.NE_TYPE;

                    checkNEtype(service_Type, ne_Type, respBody);                    
                }
            }
            logger.end();
        });
      }
  };