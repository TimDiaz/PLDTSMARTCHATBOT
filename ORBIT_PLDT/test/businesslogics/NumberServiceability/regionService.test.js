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
describe("Number Serviceability - REGION", () => {
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
        scope.post(url, reqBody).reply(mockdata.RegionMetroGNResponse.statusCode, mockdata.RegionMetroGNResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionMetroGNResponse.data.PARAM2}, [Transition] METRO`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('METRO');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionMetroGNResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(mockdata.RegionMetroGNResponse.data.PARAM2);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionMetroGSResponse.statusCode, mockdata.RegionMetroGSResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionMetroGSResponse.data.PARAM2}, [Transition] METRO`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('METRO');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionMetroGSResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(mockdata.RegionMetroGSResponse.data.PARAM2);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionMetroGEResponse.statusCode, mockdata.RegionMetroGEResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionMetroGEResponse.data.PARAM2}, [Transition] METRO`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('METRO');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionMetroGEResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(mockdata.RegionMetroGEResponse.data.PARAM2);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionMetroGWResponse.statusCode, mockdata.RegionMetroGWResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionMetroGWResponse.data.PARAM2}, [Transition] METRO`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('METRO');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionMetroGWResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(mockdata.RegionMetroGWResponse.data.PARAM2);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionLuzonSLResponse.statusCode, mockdata.RegionLuzonSLResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionLuzonSLResponse.data.PARAM2}, [Transition] LUZON`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('LUZON');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionLuzonSLResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(mockdata.RegionLuzonSLResponse.data.PARAM2);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionLuzonNLResponse.statusCode, mockdata.RegionLuzonNLResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionLuzonNLResponse.data.PARAM2}, [Transition] LUZON`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('LUZON');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionLuzonNLResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(mockdata.RegionLuzonNLResponse.data.PARAM2);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionVisayasResponse.statusCode, mockdata.RegionVisayasResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionVisayasResponse.data.PARAM2}, [Transition] VIZMIN`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('VIZMIN');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionVisayasResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(mockdata.RegionVisayasResponse.data.PARAM2);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionVisayasSMResponse.statusCode, mockdata.RegionVisayasSMResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionVisayasSMResponse.data.PARAM2}, [Transition] VIZMIN`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('VIZMIN');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionVisayasSMResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(mockdata.RegionVisayasSMResponse.data.PARAM2);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionVisayasNMResponse.statusCode, mockdata.RegionVisayasNMResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionVisayasNMResponse.data.PARAM2}, [Transition] VIZMIN`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('VIZMIN');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionVisayasNMResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(mockdata.RegionVisayasNMResponse.data.PARAM2);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionNotExistResponse.statusCode, mockdata.RegionNotExistResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionNotExistResponse.data.PARAM2}, [Transition] blank, [Remarks] NULL NE TYPE`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(3);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionNotExistResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(mockdata.RegionNotExistResponse.data.PARAM2);
                            break;
                        case 'neType':
                            expect(element.value).to.equal("NULL NE TYPE");
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionNullResponse.statusCode, mockdata.RegionNullResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionNullResponse.data.PARAM2}, [Transition] blank`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionNullResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(null);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionUndefinedResponse.statusCode, mockdata.RegionUndefinedResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionUndefinedResponse.data.PARAM2}, [Transition] blank`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionUndefinedResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(null);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionExceptionNotExistResponse.statusCode, mockdata.RegionExceptionNotExistResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionExceptionNotExistResponse.data.PARAM2}, [Transition] blank, [EXCEPTIONMSG] ${mockdata.RegionExceptionNotExistResponse.data.EXCEPTIONMSG}`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionExceptionNotExistResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(null);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.RegionExceptionOtherResponse.statusCode, mockdata.RegionExceptionOtherResponse.data);
        it(`[Status Code] 200, [City] ${mockdata.RegionExceptionOtherResponse.data.PARAM2}, [Transition] blank, [EXCEPTIONMSG] ${mockdata.RegionExceptionOtherResponse.data.EXCEPTIONMSG}`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(2);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'lineCapability':
                            expect(element.value).to.equal(mockdata.RegionExceptionOtherResponse.data.LINECAPABILITY);
                            break;
                        case 'PARAM2':
                            expect(element.value).to.equal(null);
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
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');
            })
        });

        scope.post(url, reqBody).reply(406);
        it(`[Status Code] 406, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');
            })
        });

        scope.post(url, reqBody).reply(599);
        it(`[Status Code] 599, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.RegionProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');
            })
        });
    })
})