const nock = require('nock');
const expect = require('chai').expect;
const baseConfig = require('../../../configurations/base_config');
const process = require('../../../businesslogics/billingServices_logic');
const api = require('../../../http/billingServices_http');
const mockdata = require('../../mockData/BillingServices_mockdata');
const globalProp = require('../../../helpers/globalProperties');
const instance = require("../../../helpers/logger");
const _logger = instance.logger(globalProp.Logger.Category.AccountValidation);
const logger = _logger.getLogger();

const accountNumber = '0023087278';
const serviceNumber = '0344320027';

//TURN OFF LOGGING WHILE UNIT TESTING
logger.level = 'off';

const url = `/amdocs/api/autocheckbalance/${serviceNumber}`;
const reqHeaders = {
    reqheaders: {
        'Content-Type': 'application/json',
        'X-Pldt-Auth-Token': baseConfig.SwitchToken,
        'Cookie': baseConfig.SwitchCookies,
        'Accept': 'application/json'
    }
};

logger.addContext("serviceNumber", serviceNumber);
process.LoggerInstance(logger);
api.LoggerInstance(logger);

const scope = nock(baseConfig.SwitchURL, reqHeaders);
describe("Billing Services - Auto Check Balance", () => {
    describe("API Unit Test", ()=>{
        scope.get(url).reply(200);
        it('[Status Code] 200', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                expect(req.statusCode).to.equal(200);
            })
        });

        scope.get(url).reply(400);
        it('[Status Code] 400', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                expect(req.statusCode).to.equal(400);
            })
        });

        scope.get(url,).reply(500);
        it('[Status Code] 500', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                expect(req.statusCode).to.equal(500);
            })
        });

        scope.get(url).replyWithError({
            message: '{"errno":-3008,"code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"www.pldt.com.ph"}',
            code: 'ENOTFOUND',
        });
        
        it('[Status Code] ENOTFOUND', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                expect(err.code).to.equal('ENOTFOUND');
            })
        });
    })

    describe("Process Flow SUCCESS Unit Test", () => {
        scope.get(url).reply(mockdata.ValidResponse.statusCode, mockdata.ValidResponse.data);
        it('[Status Code] 200, [Transition] valid, [Error Message] null, [Service Status] passed', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('valid');
                expect(result.Variables.length).to.equal(4);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'currentBalance':
                            expect(element.value).to.equal(parseFloat(mockdata.ValidResponse.data.balanceProfile.currentBalance).toFixed(2));
                            break;
                        case 'DueDates':
                            expect(element.value).to.equal(process.LongDateFormat(new Date(mockdata.ValidResponse.data.customerProfile[0].balanceDueDate)));
                            break;
                        case 'balEmailAdd':
                            expect(element.value).to.equal(process.MaskEmail(mockdata.ValidResponse.data.customerProfile[0].emailAddress));
                            break;
                        case 'serviceStatus':
                            expect(element.value).to.equal("passed");
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(mockdata.SuspendedResponse.statusCode, mockdata.SuspendedResponse.data);
        it('[Status Code] 200, [Transition] failure, [Error Message] null, [Service Status] Suspended', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('failure');
                expect(result.Variables.length).to.equal(4);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'currentBalance':
                            expect(element.value).to.equal(parseFloat(mockdata.SuspendedResponse.data.balanceProfile.currentBalance).toFixed(2));
                            break;
                        case 'DueDates':
                            expect(element.value).to.equal(process.LongDateFormat(new Date(mockdata.SuspendedResponse.data.customerProfile[0].balanceDueDate)));
                            break;
                        case 'balEmailAdd':
                            expect(element.value).to.equal(process.MaskEmail(mockdata.SuspendedResponse.data.customerProfile[0].emailAddress));
                            break;
                        case 'serviceStatus':
                            expect(element.value).to.equal("Suspended");
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(mockdata.BarredResponse.statusCode, mockdata.BarredResponse.data);
        it('[Status Code] 200, [Transition] failure, [Error Message] null, [Service Status] Barred', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('failure');
                expect(result.Variables.length).to.equal(4);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'currentBalance':
                            expect(element.value).to.equal(parseFloat(mockdata.BarredResponse.data.balanceProfile.currentBalance).toFixed(2));
                            break;
                        case 'DueDates':
                            expect(element.value).to.equal(process.LongDateFormat(new Date(mockdata.BarredResponse.data.customerProfile[0].balanceDueDate)));
                            break;
                        case 'balEmailAdd':
                            expect(element.value).to.equal(process.MaskEmail(mockdata.BarredResponse.data.customerProfile[0].emailAddress));
                            break;
                        case 'serviceStatus':
                            expect(element.value).to.equal("Barred");
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(mockdata.UndefinedEmailAddResponse.statusCode, mockdata.UndefinedEmailAddResponse.data);
        it('[Status Code] 200, [Transition] valid, [Service Status] passed, [Remarks] undefined email address', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('valid');
                expect(result.Variables.length).to.equal(4);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'currentBalance':
                            expect(element.value).to.equal(parseFloat(mockdata.UndefinedEmailAddResponse.data.balanceProfile.currentBalance).toFixed(2));
                            break;
                        case 'DueDates':
                            expect(element.value).to.equal(process.LongDateFormat(new Date(mockdata.UndefinedEmailAddResponse.data.customerProfile[0].balanceDueDate)));
                            break;
                        case 'balEmailAdd':
                            expect(element.value).to.equal('null');
                            break;
                        case 'serviceStatus':
                            expect(element.value).to.equal("passed");
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(mockdata.NullEmailAddResponse.statusCode, mockdata.NullEmailAddResponse.data);
        it('[Status Code] 200, [Transition] valid, [Service Status] passed, [Remarks] null email address', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('valid');
                expect(result.Variables.length).to.equal(4);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'currentBalance':
                            expect(element.value).to.equal(parseFloat(mockdata.NullEmailAddResponse.data.balanceProfile.currentBalance).toFixed(2));
                            break;
                        case 'DueDates':
                            expect(element.value).to.equal(process.LongDateFormat(new Date(mockdata.NullEmailAddResponse.data.customerProfile[0].balanceDueDate)));
                            break;
                        case 'balEmailAdd':
                            expect(element.value).to.equal('null');
                            break;
                        case 'serviceStatus':
                            expect(element.value).to.equal("passed");
                            break;
                    }
                });
            })
        });
    })

    describe("Process Flow ERROR Unit Test", () => {
        scope.get(url).reply(mockdata.InvalidResponse.statusCode, mockdata.InvalidResponse.data);
        it('[Status Code] 200, [Transition] fuseDown, [Remarks] has error message', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('fuseDown');
                expect(result.Variables.length).to.equal(0);
            })
        });

        scope.get(url).reply(mockdata.UndefinedCurrentBalanceResponse.statusCode, mockdata.UndefinedCurrentBalanceResponse.data);
        it('[Status Code] 200, [Transition] fuseDown, [Remarks] undefined current balance', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('fuseDown');
                expect(result.Variables.length).to.equal(0);
            })
        });

        scope.get(url).reply(mockdata.NullCurrentBalanceResponse.statusCode, mockdata.NullCurrentBalanceResponse.data);
        it('[Status Code] 200, [Transition] fuseDown, [Remarks] null current balance', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('fuseDown');
                expect(result.Variables.length).to.equal(0);
            })
        });

        scope.get(url).reply(mockdata.UndefinedDueDateResponse.statusCode, mockdata.UndefinedDueDateResponse.data);
        it('[Status Code] 200, [Transition] fuseDown, [Remarks] undefined due date', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('fuseDown');
                expect(result.Variables.length).to.equal(1);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'currentBalance':
                            expect(element.value).to.equal(parseFloat(mockdata.UndefinedDueDateResponse.data.balanceProfile.currentBalance).toFixed(2));
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(mockdata.NullDueDateResponse.statusCode, mockdata.NullDueDateResponse.data);
        it('[Status Code] 200, [Transition] fuseDown, [Remarks] null due date', () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('fuseDown');
                expect(result.Variables.length).to.equal(1);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'currentBalance':
                            expect(element.value).to.equal(parseFloat(mockdata.NullDueDateResponse.data.balanceProfile.currentBalance).toFixed(2));
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(400);
        it(`[Status Code] 400, [Transition] fuseDown`, () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, 'NO DATA', serviceNumber, false);
                expect(result.Transition).to.equal('fuseDown');
            })
        });

        scope.get(url).reply(406);
        it(`[Status Code] 406, [Transition] fuseDown`, () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, 'NO DATA', serviceNumber, false);
                expect(result.Transition).to.equal('fuseDown');
            })
        });

        scope.get(url).reply(599);
        it(`[Status Code] 599, [Transition] fuseDown`, () => {
            api.AutoBalRequest(serviceNumber, (err, req) => {
                const result = process.AutoBalProcess(req.statusCode, req.body, 'NO DATA', serviceNumber, false);
                expect(result.Transition).to.equal('fuseDown');
            })
        });
    })
});