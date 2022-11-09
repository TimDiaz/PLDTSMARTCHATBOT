// const globalProp = require('../../helpers/globalProperties');
const EligibilityLogic = require('../../businesslogics/eligibility_logic').Logic;
const expect = require('chai').expect;

const globalProp = require('../../helpers/globalProperties');
const instance = require("../../helpers/logger");
const _logger = instance.logger(globalProp.Logger.Category.AccountEligibility);
const logger = _logger.getLogger();
const _emailLog = instance.logger(globalProp.Logger.Category.Mailer);
const emailLog = _emailLog.getLogger();


let With_Open_Repair_Ticket_Data = {
    "eligible": false,
    "message": "With Open Repair Ticket.",
    "spiel": "Your reported concern with reference number 5553949||RBG-CRT|TECH-RESOLUTION is still being addressed. We will give you an update at the soonest possible. Thank you",
}


let logic = new EligibilityLogic(logger, emailLog, globalProp);
it('It must have Open ticket', () => {
    expect(logic.Process(With_Open_Repair_Ticket_Data.message, With_Open_Repair_Ticket_Data.spiel).Transition)
        .to.equal('withOpenIndTicket');
});

it('It must error network timeout.', () => {
    expect(logic.ErrorResponse(599).Message)
        .to.equal('[ERROR CODE: 599] Network Connect Timeout Error, Please try again later.');
});