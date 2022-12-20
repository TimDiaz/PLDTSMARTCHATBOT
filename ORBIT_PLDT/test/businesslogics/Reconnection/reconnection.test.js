const nock = require('nock');
const expect = require('chai').expect;
const baseConfig = require('../../../configurations/base_config');
const process = require('../../../businesslogics/reconnection_logic');
const api = require('../../../http/reconnection_http');
const globalProp = require('../../../helpers/globalProperties');
const instance = require("../../../helpers/logger");
const _logger = instance.logger(globalProp.Logger.Category.Reconnection);
const logger = _logger.getLogger();

const accountNumber = '0023087278';
const serviceNumber = '0344320027';

//TURN OFF LOGGING WHILE UNIT TESTING
logger.level = 'off';

const url = '/amdocs/api/account/reconnect';
const reqHeaders = {
    reqheaders: {
        'Content-Type': 'application/json',
        'X-Pldt-Auth-Token': baseConfig.AuthToken,
        'Cookie': baseConfig.Cookie
    }
};
const reqBody = JSON.stringify({
    "accountNumber": accountNumber,
    "serviceNumber": serviceNumber,
    "lastName": "null",
    "processType": "CHATBOT",
    "reconnectReason": "P2P",
    "priName": "null",
    "requestDate": "20200114",
    "amount": "20000",
    "email": "mock@email.com",
    "priName2": "null",
    "withReconnectFee": "0",
    "contactNo2": "null",
    "stmtFaxNo": "null"

});

logger.addContext("serviceNumber", serviceNumber);
process.LoggerInstance(logger);
api.LoggerInstance(logger);

const scope = nock(baseConfig.BaseUrl, reqHeaders);
describe("Reconnection", () => {
    describe("API Unit Test", ()=>{
        scope.post(url, reqBody).reply(202);
        it('[Status Code] 202', () => {
            api.PostRequest(reqBody, (err, req) => {
                expect(req.statusCode).to.equal(202);
            })
        });

        scope.post(url, reqBody).reply(400);
        it('[Status Code] 400', () => {
            api.PostRequest(reqBody, (err, req) => {
                expect(req.statusCode).to.equal(400);
            })
        });

        scope.post(url, reqBody).reply(500);
        it('[Status Code] 500', () => {
            api.PostRequest(reqBody, (err, req) => {
                expect(req.statusCode).to.equal(500);
            })
        });

        scope.post(url, reqBody).replyWithError({
            message: '{"errno":-3008,"code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"www.pldt.com.ph"}',
            code: 'ENOTFOUND',
        });
        
        it('[Status Code] ENOTFOUND', () => {
            api.PostRequest(reqBody, (err, req) => {
                expect(err.code).to.equal('ENOTFOUND');
            })
        });
    })

    describe("Process Flow SUCCESS Unit Test", () => {
        const raw0 = {"result": "0|999.99"};
        scope.post(url, reqBody).reply(202, raw0);
        it(`[Status Code] 202, [RAW] 0, [Transition] acceptedRequest`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw0.result[0])).to.equal(0);      
                expect(result.Transition).to.equal('acceptedRequest');                
            })
        });

        const raw1 = {"result": "1|999.99"};
        scope.post(url, reqBody).reply(202, raw1);
        it(`[Status Code] 202, [RAW] 1, [Transition] acceptedRequest`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw1.result[0])).to.equal(1);      
                expect(result.Transition).to.equal('acceptedRequest');                
            })
        });

        const raw2 = {"result": "2|999.99"};
        scope.post(url, reqBody).reply(202, raw2);
        it(`[Status Code] 202, [RAW] 2, [Transition] ongoingProcess`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw2.result[0])).to.equal(2);      
                expect(result.Transition).to.equal('ongoingProcess');                
            })
        });

        const raw3 = {"result": "3|999.99"};
        scope.post(url, reqBody).reply(202, raw3);
        it(`[Status Code] 202, [RAW] 3, [Transition] connectCSRMsg`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw3.result[0])).to.equal(3);      
                expect(result.Transition).to.equal('connectCSRMsg');                
            })
        });

        const raw4 = {"result": "4|999.99"};
        scope.post(url, reqBody).reply(202, raw4);
        it(`[Status Code] 202, [RAW] 4, [Transition] withOpenSO`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw4.result[0])).to.equal(4);      
                expect(result.Transition).to.equal('withOpenSO');                
            })
        });

        const raw5 = {"result": "5|999.99"};
        scope.post(url, reqBody).reply(202, raw5);
        it(`[Status Code] 202, [RAW] 5, [Transition] additionalReq`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw5.result[0])).to.equal(5);      
                expect(result.Transition).to.equal('additionalReq');                
            })
        });

        const raw6 = {"result": "6|999.99"};
        scope.post(url, reqBody).reply(202, raw6);
        it(`[Status Code] 202, [RAW] 6, [Transition] additionalReq`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw6.result[0])).to.equal(6);      
                expect(result.Transition).to.equal('additionalReq');                
            })
        });

        const raw7 = {"result": "7|999.99"};
        scope.post(url, reqBody).reply(202, raw7);
        it(`[Status Code] 202, [RAW] 7, [Transition] additionalReq`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw7.result[0])).to.equal(7);      
                expect(result.Transition).to.equal('additionalReq');                
            })
        });
    })

    describe("Process Flow ERROR Unit Test", () => {
        const raw8 = {"result": "8|999.99"};
        scope.post(url, reqBody).reply(202, raw8);
        it(`[Status Code] 202, [RAW] 8, [Transition] 406State, [Remarks] with | in result`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw8.result[0])).to.equal(8);      
                expect(result.Transition).to.equal('406State');                
            })
        });

        const raw9 = {"result": "9"};
        scope.post(url, reqBody).reply(202, raw9);
        it(`[Status Code] 202, [RAW] 9, [Transition] 406State, [Remarks] no | in result`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw9.result[0])).to.equal(9);      
                expect(result.Transition).to.equal('406State');                
            })
        });

        const raw10 = {"result": "ten|999.99"};
        scope.post(url, reqBody).reply(202, raw10);
        it(`[Status Code] 202, [RAW] 10, [Transition] 406State, [Remarks] string 10 with | in result`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false, false);

                expect(parseInt(raw10.result[0]).toString()).to.equal("NaN");      
                expect(result.Transition).to.equal('406State');                
            })
        });

        scope.post(url, reqBody).reply(400);
        it(`[Status Code] 400, [Transition] 406State`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('406State');
            })
        });

        scope.post(url, reqBody).reply(406);
        it(`[Status Code] 406, [Transition] 406State`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('406State');
            })
        });

        scope.post(url, reqBody).reply(599);
        it(`[Status Code] 599, [Transition] 406State`, () => {
            api.PostRequest(reqBody, (err, req) => {
                const result = process.Process(req.statusCode, req.body, accountNumber, serviceNumber, false);

                expect(result.Transition).to.equal('406State');
            })
        });
    })
})