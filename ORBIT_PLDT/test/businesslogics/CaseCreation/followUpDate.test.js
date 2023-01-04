const expect = require('chai').expect;
const process = require('../../../businesslogics/caseCreation_logic');
const mockData = require('../../mockData/CaseCreation_mockdata');
const globalProp = require('../../../helpers/globalProperties');
const instance = require("../../../helpers/logger");
const _logger = instance.logger(globalProp.Logger.Category.CaseCreation.PaymentDate);
const logger = _logger.getLogger();

const accountNumber = '0023087278';
const serviceNumber = '0344320027';

//TURN OFF LOGGING WHILE UNIT TESTING
logger.level = 'off';


logger.addContext("serviceNumber", serviceNumber);
process.LoggerInstance(logger);

describe("Case Creation - Follow Up Date - No API Calls", () => {
    describe("Process Flow SUCCESS Unit Test", () => {
        it(`[Status Code] 200, [Transition] validDate, [Remarks] user date is less than 2 days from the current date`, () => {          
            const result = process.FollowupDateLogic(mockData.FollowUpDate.UserDateLessThanCurrentDate.data.Date);

            expect(result.Transition).to.equal('validDate');
        });

        it(`[Status Code] 200, [Transition] invalidDate, [Remarks] user date is equal from the current date`, () => {          
            const result = process.FollowupDateLogic(mockData.FollowUpDate.UserDateEqualCurrentDate.data.Date);

            expect(result.Transition).to.equal('validDate');
        });

        it(`[Status Code] 200, [Transition] invalidDate, [Remarks] user date is greater than 1 day from the current date`, () => {          
            const result = process.FollowupDateLogic(mockData.FollowUpDate.UserDateGreaterThanCurrentDate.data.Date);

            expect(result.Transition).to.equal('invalidDate');
        });

        it(`[Status Code] 200, [Transition] invalidDate`, () => {          
            const result = process.FollowupDateLogic(mockData.FollowUpDate.InvalidUserDate.data.Date);

            expect(result.Transition).to.equal('invalidDate');
        });
    })
});

