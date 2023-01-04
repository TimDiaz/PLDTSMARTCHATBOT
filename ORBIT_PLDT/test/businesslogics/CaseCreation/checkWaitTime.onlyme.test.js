const nock = require('nock');
const expect = require('chai').expect;
const baseConfig = require('../../../configurations/base_config');
const process = require('../../../businesslogics/caseCreation_logic');
const api = require('../../../http/caseCreation_http');
const mockData = require('../../../test/mockData/CaseCreation_mockdata');
const globalProp = require('../../../helpers/globalProperties');
const instance = require("../../../helpers/logger");
const _logger = instance.logger(globalProp.Logger.Category.CaseCreation.CheckWaitTime);
const logger = _logger.getLogger();

const accountNumber = '0023087278';
const serviceNumber = '0344320027';
const deploymentId = '5722v000000gloF';
const buttonId = '5732v000000gn4p'

//TURN OFF LOGGING WHILE UNIT TESTING
logger.level = 'off';

const url = `/chat/rest/Visitor/Availability?org_id=${baseConfig.CaseCreation.CheckWaitTime.Base.OrgId}&deployment_id=${deploymentId}&Availability.ids=${buttonId}&Availability.needEstimatedWaitTime=1`;
const reqHeaders = {
    reqheaders: {
        'X-LIVEAGENT-API-VERSION': '34'
    }
};

logger.addContext("serviceNumber", serviceNumber);
process.LoggerInstance(logger);
api.LoggerInstance(logger);

const scope = nock(baseConfig.CaseCreation.CheckWaitTime.Base.Url, reqHeaders);
describe("Case Creation - Check Wait Time", () => {
    describe("API Unit Test", ()=>{
        scope.get(url).reply(200);
        it('[Status Code] 200', () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                expect(req.statusCode).to.equal(200);
            })
        });

        scope.get(url).reply(400);
        it('[Status Code] 400', () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                expect(req.statusCode).to.equal(400);
            })
        });

        scope.get(url).reply(500);
        it('[Status Code] 500', () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                expect(req.statusCode).to.equal(500);
            })
        });

        scope.get(url).replyWithError({
            message: '{"errno":-3008,"code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"www.pldt.com.ph"}',
            code: 'ENOTFOUND',
        });
        
        it('[Status Code] ENOTFOUND', () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                expect(err.code).to.equal('ENOTFOUND');
            })
        });
    })

    describe("Process Flow SUCCESS Unit Test", () => {
        scope.get(url).reply(mockData.CheckWaitTime.AvailableAgents.statusCode, mockData.CheckWaitTime.AvailableAgents.data);
        it(`[Status Code] 200, [Transition] agentAvail, [Estimated Time is seconds] ${mockData.CheckWaitTime.AvailableAgents.data.messages[0].message.results[0].estimatedWaitTime}`, () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                const result = process.CheckWaitTimeLogic(req.statusCode, req.body, accountNumber, serviceNumber, deploymentId, buttonId, false);

                expect(result.Transition).to.equal('agentAvail');
                expect(result.Variables.length).to.equal(3);
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'waitTime':
                            expect(element.value).to.equal(Math.round((mockData.CheckWaitTime.AvailableAgents.data.messages[0].message.results[0].estimatedWaitTime) / (60)));
                            break;
                        case 'waitTimeSec':
                            expect(parseInt(element.value)).to.equal(mockData.CheckWaitTime.AvailableAgents.data.messages[0].message.results[0].estimatedWaitTime);
                            break;
                        case 'LiveAgent_queue':
                            expect(element.value).to.equal(process.GetQueueName(deploymentId, buttonId));
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(mockData.CheckWaitTime.LessThanMaxThresholdAgents.statusCode, mockData.CheckWaitTime.LessThanMaxThresholdAgents.data);
        it(`[Status Code] 200, [Transition] directToAgent, [Estimated Time is seconds] ${mockData.CheckWaitTime.LessThanMaxThresholdAgents.data.messages[0].message.results[0].estimatedWaitTime}, [Remarks] less than max threshold`, () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                const result = process.CheckWaitTimeLogic(req.statusCode, req.body, accountNumber, serviceNumber, deploymentId, buttonId, false);

                expect(result.Transition).to.equal('directToAgent');
                expect(result.Variables.length).to.equal(3);
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'waitTime':
                            expect(element.value).to.equal(Math.round((mockData.CheckWaitTime.LessThanMaxThresholdAgents.data.messages[0].message.results[0].estimatedWaitTime) / (60)));
                            break;
                        case 'waitTimeSec':
                            expect(parseInt(element.value)).to.equal(mockData.CheckWaitTime.LessThanMaxThresholdAgents.data.messages[0].message.results[0].estimatedWaitTime);
                            break;
                        case 'LiveAgent_queue':
                            expect(element.value).to.equal(process.GetQueueName(deploymentId, buttonId));
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(mockData.CheckWaitTime.GreaterThanMaxThresholdAgents.statusCode, mockData.CheckWaitTime.GreaterThanMaxThresholdAgents.data);
        it(`[Status Code] 200, [Transition] directToCase, [Estimated Time is seconds] ${mockData.CheckWaitTime.GreaterThanMaxThresholdAgents.data.messages[0].message.results[0].estimatedWaitTime}, [Remarks] greater than max threshold`, () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                const result = process.CheckWaitTimeLogic(req.statusCode, req.body, accountNumber, serviceNumber, deploymentId, buttonId, false);

                expect(result.Transition).to.equal('directToCase');
                expect(result.Variables.length).to.equal(4);
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'waitTime':
                            expect(element.value).to.equal(Math.round((mockData.CheckWaitTime.GreaterThanMaxThresholdAgents.data.messages[0].message.results[0].estimatedWaitTime) / (60)));
                            break;
                        case 'waitTimeSec':
                            expect(parseInt(element.value)).to.equal(mockData.CheckWaitTime.GreaterThanMaxThresholdAgents.data.messages[0].message.results[0].estimatedWaitTime);
                            break;
                        case 'LiveAgent_queue':
                            expect(element.value).to.equal(process.GetQueueName(deploymentId, buttonId));
                            break;
                    }
                });
            })
        });
    })

    describe("Process Flow ERROR Unit Test", () => {
        scope.get(url).reply(mockData.CheckWaitTime.UndefinedEstimatedWaitTimeAgents.statusCode, mockData.CheckWaitTime.UndefinedEstimatedWaitTimeAgents.data);
        it(`[Status Code] 200, [Transition] failure, [Estimated Time is seconds] undefined`, () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                const result = process.CheckWaitTimeLogic(req.statusCode, req.body, accountNumber, serviceNumber, deploymentId, buttonId, false);

                expect(result.Transition).to.equal('failure');
                expect(result.Variables.length).to.equal(3);
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'waitTime':
                            expect(element.value).to.equal('undefined');
                            break;
                        case 'waitTimeSec':
                            expect(element.value).to.equal(0);
                            break;
                        case 'LiveAgent_queue':
                            expect(element.value).to.equal(process.GetQueueName(deploymentId, buttonId));
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(mockData.CheckWaitTime.NullEstimatedWaitTimeAgents.statusCode, mockData.CheckWaitTime.NullEstimatedWaitTimeAgents.data);
        it(`[Status Code] 200, [Transition] failure, [Estimated Time is seconds] Null`, () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                const result = process.CheckWaitTimeLogic(req.statusCode, req.body, accountNumber, serviceNumber, deploymentId, buttonId, false);

                expect(result.Transition).to.equal('failure');
                expect(result.Variables.length).to.equal(3);
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'waitTime':
                            expect(element.value).to.equal('undefined');
                            break;
                        case 'waitTimeSec':
                            expect(element.value).to.equal(0);
                            break;
                        case 'LiveAgent_queue':
                            expect(element.value).to.equal(process.GetQueueName(deploymentId, buttonId));
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(mockData.CheckWaitTime.NaNEstimatedWaitTimeAgents.statusCode, mockData.CheckWaitTime.NaNEstimatedWaitTimeAgents.data);
        it(`[Status Code] 200, [Transition] failure, [Estimated Time is seconds] NaN`, () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                const result = process.CheckWaitTimeLogic(req.statusCode, req.body, accountNumber, serviceNumber, deploymentId, buttonId, false);

                expect(result.Transition).to.equal('failure');
                expect(result.Variables.length).to.equal(3);
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'waitTime':
                            expect(element.value).to.equal('undefined');
                            break;
                        case 'waitTimeSec':
                            expect(element.value).to.equal(0);
                            break;
                        case 'LiveAgent_queue':
                            expect(element.value).to.equal(process.GetQueueName(deploymentId, buttonId));
                            break;
                    }
                });
            })
        });

        scope.get(url).reply(400);
        it(`[Status Code] 400, [Transition] failure`, () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                const result = process.CheckWaitTimeLogic(req.statusCode, req.body, accountNumber, serviceNumber, deploymentId, buttonId, false);

                expect(result.Transition).to.equal('failure');
            })
        });

        scope.get(url).reply(406);
        it(`[Status Code] 406, [Transition] failure`, () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                const result = process.CheckWaitTimeLogic(req.statusCode, req.body, accountNumber, serviceNumber, deploymentId, buttonId, false);

                expect(result.Transition).to.equal('failure');
            })
        });

        scope.get(url).reply(599);
        it(`[Status Code] 599, [Transition] failure`, () => {
            api.CheckWaitTimeRequest(deploymentId, buttonId, (err, req) => {
                const result = process.CheckWaitTimeLogic(req.statusCode, req.body, accountNumber, serviceNumber, deploymentId, buttonId, false);

                expect(result.Transition).to.equal('failure');
            })
        });
    })
});

