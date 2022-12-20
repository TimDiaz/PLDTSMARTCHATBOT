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
describe("Number Serviceability - TECHNOLOGY", () => {
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
        scope.post(url, reqBody).reply(mockdata.TechFTTXResponse.statusCode, mockdata.TechFTTXResponse.data);
        it(`[Status Code] 200, [CURRENTTECHNOLOGY] ${mockdata.TechFTTXResponse.data.CURRENTTECHNOLOGY}, [Transition] fibrAcct`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('fibrAcct');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'neType':
                            expect(element.value).to.equal(mockdata.TechFTTXResponse.data.CURRENTTECHNOLOGY);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechFTTHResponse.statusCode, mockdata.TechFTTHResponse.data);
        it(`[Status Code] 200, [CURRENTTECHNOLOGY] ${mockdata.TechFTTHResponse.data.CURRENTTECHNOLOGY}, [Transition] fibrAcct`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('fibrAcct');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'neType':
                            expect(element.value).to.equal(mockdata.TechFTTHResponse.data.CURRENTTECHNOLOGY);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechFIBERResponse.statusCode, mockdata.TechFIBERResponse.data);
        it(`[Status Code] 200, [CURRENTTECHNOLOGY] ${mockdata.TechFIBERResponse.data.CURRENTTECHNOLOGY}, [Transition] fibrAcct`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('fibrAcct');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'neType':
                            expect(element.value).to.equal(mockdata.TechFIBERResponse.data.CURRENTTECHNOLOGY);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechFIBRResponse.statusCode, mockdata.TechFIBRResponse.data);
        it(`[Status Code] 200, [CURRENTTECHNOLOGY] ${mockdata.TechFIBRResponse.data.CURRENTTECHNOLOGY}, [Transition] fibrAcct`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('fibrAcct');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'neType':
                            expect(element.value).to.equal(mockdata.TechFIBRResponse.data.CURRENTTECHNOLOGY);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechDSLResponse.statusCode, mockdata.TechDSLResponse.data);
        it(`[Status Code] 200, [CURRENTTECHNOLOGY] ${mockdata.TechDSLResponse.data.CURRENTTECHNOLOGY}, [Transition] dslAcct`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('dslAcct');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'neType':
                            expect(element.value).to.equal(mockdata.TechDSLResponse.data.CURRENTTECHNOLOGY);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechVDSLResponse.statusCode, mockdata.TechVDSLResponse.data);
        it(`[Status Code] 200, [CURRENTTECHNOLOGY] ${mockdata.TechVDSLResponse.data.CURRENTTECHNOLOGY}, [Transition] dslAcct`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('dslAcct');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'neType':
                            expect(element.value).to.equal(mockdata.TechVDSLResponse.data.CURRENTTECHNOLOGY);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechNGNResponse.statusCode, mockdata.TechNGNResponse.data);
        it(`[Status Code] 200, [CURRENTTECHNOLOGY] ${mockdata.TechNGNResponse.data.CURRENTTECHNOLOGY}, [Transition] dslAcct`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('dslAcct');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'neType':
                            expect(element.value).to.equal(mockdata.TechNGNResponse.data.CURRENTTECHNOLOGY);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechLEGACYResponse.statusCode, mockdata.TechLEGACYResponse.data);
        it(`[Status Code] 200, [CURRENTTECHNOLOGY] ${mockdata.TechLEGACYResponse.data.CURRENTTECHNOLOGY}, [Transition] dslAcct`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('dslAcct');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'neType':
                            expect(element.value).to.equal(mockdata.TechLEGACYResponse.data.CURRENTTECHNOLOGY);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechUndefinedResponse.statusCode, mockdata.TechUndefinedResponse.data);
        it(`[Status Code] 200, [CURRENTTECHNOLOGY] ${mockdata.TechUndefinedResponse.data.CURRENTTECHNOLOGY}, [Transition] blank`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'neType':
                            expect(element.value).to.equal("NULL NE TYPE");
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechNullResponse.statusCode, mockdata.TechNullResponse.data);
        it(`[Status Code] 200, [CURRENTTECHNOLOGY] ${mockdata.TechNullResponse.data.CURRENTTECHNOLOGY}, [Transition] blank`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(1);
                
                result.Variables.forEach(element => {
                    switch(element.name){
                        case 'neType':
                            expect(element.value).to.equal("NULL NE TYPE");
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechExceptionNotExistResponse.statusCode, mockdata.TechExceptionNotExistResponse.data);
        it(`[Status Code] 200, [EXCEPTIONMSG] ${mockdata.TechExceptionNotExistResponse.data.EXCEPTIONMSG}, [Transition] blank`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(0);
            })
        });

        scope.post(url, reqBody).reply(mockdata.TechExceptionOtherResponse.statusCode, mockdata.TechExceptionOtherResponse.data);
        it(`[Status Code] 200, [EXCEPTIONMSG] ${mockdata.TechExceptionOtherResponse.data.EXCEPTIONMSG}, [Transition] blank`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('blank');
                expect(result.Variables.length).to.equal(0);
            })
        });
    })

    describe("Process Flow ERROR Unit Test", () => {
        scope.post(url, reqBody).reply(400);
        it(`[Status Code] 400, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');
            })
        });

        scope.post(url, reqBody).reply(406);
        it(`[Status Code] 406, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');
            })
        });

        scope.post(url, reqBody).reply(599);
        it(`[Status Code] 599, [Transition] failure`, () => {
            api.PostRequest(areacode, telephone, (err, req) => {
                const result = process.TechProcess(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('failure');
            })
        });
    })
})