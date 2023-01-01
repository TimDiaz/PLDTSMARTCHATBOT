const expect = require('chai').expect;
const process = require('../../../businesslogics/caseCreation_logic');
const globalProp = require('../../../helpers/globalProperties');
const instance = require("../../../helpers/logger");
const _logger = instance.logger(globalProp.Logger.Category.CaseCreation.PaymentDate);
const logger = _logger.getLogger();

//TURN OFF LOGGING WHILE UNIT TESTING
logger.level = 'off';



logger.addContext("serviceNumber", serviceNumber);
process.LoggerInstance(logger);

describe("Case Creation - Payment Date - No API Calls", () => {
    describe("Process Flow SUCCESS Unit Test", () => {
        it(`[Status Code] 200, [isValid] ${validResponse.isValid}, [Transition] validAcct, [Call Type] ${validResponse.callType}`, () => {          
            const result = process.PaymentDateLogic(userDate);

            expect(result.Transition).to.equal('validAcct');
            
            result.Variables.forEach(element => {
                switch(element.name){
                    case 'validacctmsg':
                        expect(element.value).to.equal(validResponse.message);
                        break;
                    case 'withExtension':
                        expect(element.value).to.equal(validResponse.extension);
                        break;
                    case 'callType':
                        expect(element.value).to.equal(validResponse.callType);
                        break;
                }
            });       
        });
    })
});

