"use strict";

const componentName = require('../../configurations/component_config');
module.exports = {
    metadata: () => ({
        name: componentName.FollowUpDate,
        properties: {
            serviceNumber: {
                type: "string",
                required: true
            },
            requestDate: {
                type: "date",
                required: true
            },
        },
        supportedActions: ['validDate', 'invalidDate', 'invalidFutureDate', 'failure', 'InvalidDateFormat']
    }),
    invoke: (conversation, done) => {
        
        // #region Setup Properties
        const serviceNumber = conversation.properties().serviceNumber;
        const userDate = conversation.properties().requestDate;
        // #endregion

        // #region Imports
        const moment = require('moment');
        const globalProp = require('../../helpers/globalProperties');
        const instance = require("../../helpers/logger");
        // #endregion
        
        // #region Initialization
        const _logger = instance.logger(globalProp.Logger.Category.CaseCreation.FollowUpDate);
        const logger = _logger.getLogger();

        logger.start = (() => {
            logger.info(`-------------------------------------------------------------------------------------------------------------`);
            logger.info(`- [START] Follow Up Date                                                                                    -`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`);
        });

        logger.end = (() => {
            logger.info(`[Transition]: ${transition}`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`);
            logger.info(`- [END] Follow Up Date                                                                                      -`);
            logger.info(`-------------------------------------------------------------------------------------------------------------`);

            _logger.shutdown();

            conversation.transition(transition);
            done();
        });

        let transition = '';

        logger.addContext("serviceNumber", serviceNumber);
        // #endregion

        logger.start();

        var validDate = moment(userDate, "mm/dd/yyyy").isValid();
        var date2 = new Date(userDate);
        logger.info(`date 2 : ${date2}`);
        var date1 = new Date();
        var givenDate = new Date(userDate);

        function appendLeadingZeroes(n) {
            if (n <= 9) {
                return "0" + n;
            }
            return n
        }

        let formatted_date = appendLeadingZeroes(date1.getMonth() + 1) + "/" + appendLeadingZeroes(date1.getDate()) + "/" + date1.getFullYear();
        let formatted_userDate = appendLeadingZeroes(date2.getMonth() + 1) + "/" + appendLeadingZeroes(date2.getDate()) + "/" + date2.getFullYear();
        logger.info(`formatted_date : ${formatted_date}`);
        logger.info(`formatted_userDate : ${formatted_userDate}`);
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        logger.info(`Difference in days: ${diffDays}`);
        var CurrentDate = new Date();
        
        //User input Date is not older that 3 days of todays date
        if (moment(userDate, 'MM/DD/YYYY', true).isValid()) {
            if (givenDate <= CurrentDate) {
                conversation.keepTurn(true);
                logger.debug(`Valid Date Format! ${givenDate} is less than or equal to ${CurrentDate}`);
                transition = 'validDate';
            }

            else if(givenDate > CurrentDate)  {
                conversation.keepTurn(true);
                logger.debug(`Invalid date futuristic`);
                transition = 'invalidDate';
            }
            else{
                conversation.keepTurn(true);
                logger.debug(`Invalid date futuristic`);
                transition = 'invalidDate';
            }
        }
        else {
            conversation.keepTurn(true);
            logger.debug(`Invalid Date more than 3 days of current date`);
            transition = 'invalidDate';
        }
        logger.end();
    }
};


