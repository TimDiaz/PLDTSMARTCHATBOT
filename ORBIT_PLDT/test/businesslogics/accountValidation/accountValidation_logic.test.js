const nock = require('nock');
const expect = require('chai').expect;
const baseConfig = require('../../../configurations/base_config');
const process = require('../../../businesslogics/accountValidation_logic');
const api = require('../../../http/accountValidation_http');
const globalProp = require('../../../helpers/globalProperties');
const instance = require("../../../helpers/logger");
const _logger = instance.logger(globalProp.Logger.Category.AccountValidation);
const logger = _logger.getLogger();

const accountNumber = '0023087278';
const serviceNumber = '0344320027';

//TURN OFF LOGGING WHILE UNIT TESTING
logger.level = 'off';

const url = '/amdocs/api/account/validate';
const reqHeaders = {
    reqheaders: {
        'Content-Type': 'application/json',
        'X-Pldt-Auth-Token': baseConfig.SwitchToken,
        'Cookie': baseConfig.SwitchCookies
    }
};
const reqBody = {
    "accountNumber": accountNumber,
    "serviceNumber": serviceNumber
};

logger.addContext("serviceNumber", serviceNumber);
process.LoggerInstance(logger);
api.LoggerInstance(logger);

const scope = nock(baseConfig.SwitchURL, reqHeaders);
describe("Account Validation", () => {
    describe("API Unit Test", ()=>{
        scope.post(url, reqBody).reply(200, {"isValid":true});
        it('[Status Code] 200, [isValid] true', () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                expect(req.statusCode).to.equal(200);
                expect(JSON.parse(req.body).isValid).to.equal(true);
            })
        });

        scope.post(url, reqBody).reply(200, {"isValid":false});
        it('[Status Code] 200, [isValid] false', () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                expect(req.statusCode).to.equal(200);
                expect(JSON.parse(req.body).isValid).to.equal(false);
            })
        });

        scope.post(url, reqBody).reply(400);
        it('[Status Code] 400, [isValid] false', () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                expect(req.statusCode).to.equal(400);
            })
        });

        scope.post(url, reqBody).reply(500);
        it('[Status Code] 500, [isValid] false', () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                expect(req.statusCode).to.equal(500);
            })
        });

        scope.post(url, reqBody).replyWithError({
            message: '{"errno":-3008,"code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"www.pldt.com.ph"}',
            code: 'ENOTFOUND',
        });
        
        it('[Status Code] ENOTFOUND', () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                expect(err.code).to.equal('ENOTFOUND');
            })
        });
    })

    describe("Process Flow SUCCESS Unit Test", () => {
        const validResponse = {
            isValid: true,
            packageDescription: "Regular Residential",
            message: "Account is active",
            callType: "NDD",
            extension: false
        };
        scope.post(url, reqBody).reply(200, validResponse);
        it(`[Status Code] 200, [isValid] ${validResponse.isValid}, [Transition] validAcct, [Call Type] ${validResponse.callType}`, () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false);

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
            })
        });

        const validResponse2 = {
            isValid: true,
            packageDescription: "Regular Residential",
            message: "Account is active",
            callType: null,
            extension: false
        };
        scope.post(url, reqBody).reply(200, validResponse2);
        it(`[Status Code] 200, [isValid] ${validResponse2.isValid}, [Transition] validAcct, [Call Type] No Call Type`, () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('validAcct');
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'validacctmsg':
                            expect(element.value).to.equal(validResponse2.message);
                            break;
                        case 'withExtension':
                            expect(element.value).to.equal(validResponse2.extension);
                            break;
                        case 'callType':
                            expect(element.value).to.equal('No call type');
                            break;
                    }
                });
            })
        });

        const inValidResponse = {
            isValid: false,
            packageDescription: "",
            message: "Invalid account number and service number combination",
            callType: null,
            extension: ""
        };
        scope.post(url, reqBody).reply(200, inValidResponse);
        it(`[Status Code] 200, [isValid] ${inValidResponse.isValid}, [Transition] invalidAcct, [Call Type] ${inValidResponse.callType}`, () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('invalidAcct');
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'invalidacctmsg':
                            expect(element.value).to.equal(inValidResponse.message);
                            break;
                    }
                });
            })
        });

    })

    describe("Process Flow ERROR Unit Test", () => {
        scope.post(url, reqBody).reply(400);
        it(`[Status Code] 400, [Transition] invalidAcct`, () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('invalidAcct');
            })
        });

        scope.post(url, reqBody).reply(406, {message: 'Error 406'});
        it(`[Status Code] 406, [Transition] failure`, () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');

                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'invalidacctmsg':
                            expect(element.value).to.equal('Error 406');
                            break;
                    }
                });

            })
        });

        scope.post(url, reqBody).reply(599, {message: 'Error 599'});
        it(`[Status Code] 599, [Transition] failure`, () => {
            api.PostRequest(accountNumber, serviceNumber, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');
                expect(result.Reply[0].text).to.equal(`599 Network Connect Timeout Error, Please try again later.`);
            })
        });
    })
});

