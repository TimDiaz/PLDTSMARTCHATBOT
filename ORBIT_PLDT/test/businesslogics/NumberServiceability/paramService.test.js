const nock = require('nock');
const expect = require('chai').expect;
const baseConfig = require('../../../configurations/base_config');
const process = require('../../../businesslogics/numberServiceability_logic');
const api = require('../../../http/numberServiceability_http');
const mockdata = require('../../mockData/NumberServiceability_mockdata');
const globalProp = require('../../../helpers/globalProperties');
const instance = require("../../../helpers/logger");
const _logger = instance.logger(globalProp.Logger.Category.AccountValidation);
const logger = _logger.getLogger();

const accountNumber = '0023087278';
const serviceNumber = '0344320027';
const areacode = '034';
const telephone = '4320027';

//TURN OFF LOGGING WHILE UNIT TESTING
logger.level = 'off';

const url = '/pldthome/api/serviceability/number/serviceable';
const reqHeaders = {
    reqheaders: {
        'Content-Type': 'application/json',
        'Cookie': baseConfig.SwitchCookies
    }
};
const reqBody = {
    "AREACODE": areacode,
    "TELEPHONE": telephone,
    "CONSUMER": globalProp.NumberServiceability.API.Serviceable.Consumer,
    "TOKEN": globalProp.NumberServiceability.API.Serviceable.Token
};

logger.addContext("serviceNumber", serviceNumber);
process.LoggerInstance(logger);
api.LoggerInstance(logger);

const scope = nock(baseConfig.SwitchURL, reqHeaders);
describe("Number Serviceability - PARAM", () => {
    describe("API Unit Test", ()=>{
        scope.post(url, reqBody).reply(200);
        it('[Status Code] 200', () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                expect(req.statusCode).to.equal(200);
            })
        });

        scope.post(url, reqBody).reply(400);
        it('[Status Code] 400', () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                expect(req.statusCode).to.equal(400);
            })
        });

        scope.post(url, reqBody).reply(500);
        it('[Status Code] 500', () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                expect(req.statusCode).to.equal(500);
            })
        });

        scope.post(url, reqBody).replyWithError({
            message: '{"errno":-3008,"code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"www.pldt.com.ph"}',
            code: 'ENOTFOUND',
        });
        
        it('[Status Code] ENOTFOUND', () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                expect(err.code).to.equal('ENOTFOUND');
            })
        });
    })

    describe("Process Flow SUCCESS Unit Test", () => {
        scope.post(url, reqBody).reply(mockdata.ParamVipZoneCLA.statusCode, mockdata.ParamVipZoneCLA.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamVipZoneCLA.data.PARAM1}, [PARAM3] ${mockdata.ParamVipZoneCLA.data.PARAM3}, [Transition] VipZone`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('VipZone');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`${mockdata.ParamVipZoneCLA.data.PARAM1}-${mockdata.ParamVipZoneCLA.data.PARAM3}`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamVipZoneCVE.statusCode, mockdata.ParamVipZoneCVE.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamVipZoneCVE.data.PARAM1}, [PARAM3] ${mockdata.ParamVipZoneCVE.data.PARAM3}, [Transition] VipZone`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('VipZone');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`${mockdata.ParamVipZoneCVE.data.PARAM1}-${mockdata.ParamVipZoneCVE.data.PARAM3}`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamVipZoneQCY.statusCode, mockdata.ParamVipZoneQCY.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamVipZoneQCY.data.PARAM1}, [PARAM3] ${mockdata.ParamVipZoneQCY.data.PARAM3}, [Transition] VipZone`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('VipZone');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`${mockdata.ParamVipZoneQCY.data.PARAM1}-${mockdata.ParamVipZoneQCY.data.PARAM3}`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamVipZoneSFP.statusCode, mockdata.ParamVipZoneSFP.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamVipZoneSFP.data.PARAM1}, [PARAM3] ${mockdata.ParamVipZoneSFP.data.PARAM3}, [Transition] VipZone`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('VipZone');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`${mockdata.ParamVipZoneSFP.data.PARAM1}-${mockdata.ParamVipZoneSFP.data.PARAM3}`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamVipZoneMDE.statusCode, mockdata.ParamVipZoneMDE.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamVipZoneMDE.data.PARAM1}, [PARAM3] ${mockdata.ParamVipZoneMDE.data.PARAM3}, [Transition] VipZone`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('VipZone');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`${mockdata.ParamVipZoneMDE.data.PARAM1}-${mockdata.ParamVipZoneMDE.data.PARAM3}`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamVipZoneJNE.statusCode, mockdata.ParamVipZoneJNE.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamVipZoneJNE.data.PARAM1}, [PARAM3] ${mockdata.ParamVipZoneJNE.data.PARAM3}, [Transition] VipZone`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('VipZone');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`${mockdata.ParamVipZoneJNE.data.PARAM1}-${mockdata.ParamVipZoneJNE.data.PARAM3}`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamVipZoneMDECC.statusCode, mockdata.ParamVipZoneMDECC.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamVipZoneMDECC.data.PARAM1}, [PARAM3] ${mockdata.ParamVipZoneMDECC.data.PARAM3}, [Transition] VipZone`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('VipZone');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`${mockdata.ParamVipZoneMDECC.data.PARAM1}-${mockdata.ParamVipZoneMDECC.data.PARAM3}`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamValenzuela.statusCode, mockdata.ParamValenzuela.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamValenzuela.data.PARAM1}, [PARAM3] ${mockdata.ParamValenzuela.data.PARAM3}, [Transition] param3, [Remarks] null param1`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('param3');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`${mockdata.ParamValenzuela.data.PARAM1}-${mockdata.ParamValenzuela.data.PARAM3}`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamParam3Null.statusCode, mockdata.ParamParam3Null.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamValenzuela.data.PARAM1}, [PARAM3] ${mockdata.ParamParam3Null.data.PARAM3}, [Transition] blank, [Remarks] null param1 and param3`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`${mockdata.ParamParam3Null.data.PARAM1}-${mockdata.ParamParam3Null.data.PARAM3}`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamParam1Undefined.statusCode, mockdata.ParamParam1Undefined.data);
        it(`[Status Code] 200, [PARAM1] null, [PARAM3] ${mockdata.ParamParam1Undefined.data.PARAM3}, [Transition] param3, [Remarks] undefined param1`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('param3');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`null-${mockdata.ParamParam1Undefined.data.PARAM3}`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamParam3Undefined.statusCode, mockdata.ParamParam3Undefined.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamParam3Undefined.data.PARAM1}, [PARAM3] null, [Transition] blank, [Remarks] undefined param3`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`${mockdata.ParamParam3Undefined.data.PARAM1}-null`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamParam1Param3Null.statusCode, mockdata.ParamParam1Param3Null.data);
        it(`[Status Code] 200, [PARAM1] ${mockdata.ParamParam1Param3Null.data.PARAM1}, [PARAM3] ${mockdata.ParamParam1Param3Null.data.PARAM3}, [Transition] blank, [Remarks] null param1 and param3`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`null-null`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamParam1Param3Undefined.statusCode, mockdata.ParamParam1Param3Undefined.data);
        it(`[Status Code] 200, [PARAM1] null, [PARAM3] null, [Transition] blank, [Remarks] undefined param1 and param3`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`null-null`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamExceptionNotExistResponse.statusCode, mockdata.ParamExceptionNotExistResponse.data);
        it(`[Status Code] 200, [PARAM1] null, [PARAM3] null, [Transition] blank, [EXCEPTIONMSG] ${mockdata.ParamExceptionNotExistResponse.data.EXCEPTIONMSG}`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`null-null`);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.ParamExceptionOtherResponse.statusCode, mockdata.ParamExceptionOtherResponse.data);
        it(`[Status Code] 200, [PARAM1] null, [PARAM3] null, [Transition] blank, [EXCEPTIONMSG] ${mockdata.ParamExceptionOtherResponse.data.EXCEPTIONMSG}`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'PARAM3':
                            expect(element.value).to.equal(`null-null`);
                            break;
                    }
                });
            })
        });
    })

    describe("Process Flow ERROR Unit Test", () => {
        scope.post(url, reqBody).reply(400);
        it(`[Status Code] 400, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');
                expect(result.Variables.length).to.equal(1);

                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'errorCode':
                            expect(element.value).to.equal(400);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(404);
        it(`[Status Code] 404, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');
                expect(result.Variables.length).to.equal(1);

                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'errorCode':
                            expect(element.value).to.equal(404);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(406);
        it(`[Status Code] 406, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');

                expect(result.Variables.length).to.equal(1);

                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'errorCode':
                            expect(element.value).to.equal(406);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(408);
        it(`[Status Code] 408, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');

                expect(result.Variables.length).to.equal(1);

                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'errorCode':
                            expect(element.value).to.equal(408);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(500);
        it(`[Status Code] 500, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');

                expect(result.Variables.length).to.equal(1);

                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'errorCode':
                            expect(element.value).to.equal(500);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(504);
        it(`[Status Code] 504, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');

                expect(result.Variables.length).to.equal(1);

                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'errorCode':
                            expect(element.value).to.equal(504);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(599);
        it(`[Status Code] 599, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.ParamProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');

                expect(result.Variables.length).to.equal(0);
            })
        });
    })
})