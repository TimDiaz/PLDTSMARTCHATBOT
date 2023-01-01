const nock = require('nock');
const expect = require('chai').expect;
const baseConfig = require('../../../configurations/base_config');
const process = require('../../../businesslogics/ticketCreation_logic');
const mockdata = require('../../mockData/TicketCreation_mockdata');
const api = require('../../../http/ticketCreation_http');
const globalProp = require('../../../helpers/globalProperties');
const instance = require("../../../helpers/logger");
const _logger = instance.logger(globalProp.Logger.Category.TicketCreation.ticketcreationcreateft);
const logger = _logger.getLogger();

const accountNumber = '0023087278';
const serviceNumber = '0344320027';
const reportedBy = 'me';
const sysDate = new Date(Date.now()).toLocaleDateString();

//TURN OFF LOGGING WHILE UNIT TESTING
logger.level = 'off';

const url = '/askpldt-api/customers/tickets';
const reqHeaders = {
    reqheaders: {
        'Content-Type': 'application/json',
        'Cookie': baseConfig.Cookie
    }
};
const reqBody = JSON.stringify({
    description: "FIBER CUT_Fault Located-Distribution_NAP-ONU [LSCODE: 409040501]",
    empeId: "MOBILEIT",
    faultType: "RBG-CRT",
    priority: "5",
    promCause: "100",
    reportedBy: "CHATBOT_LM",
    telephoneNumber: "0286438991",
    promSubType: "VD-NO VOICE AND DATA",
    promWorgName: "IVRS",
    promCategory: "LAST MILE",
    promSubCategory: "FIBERCUT - NAP TO ONU"
});

logger.addContext("serviceNumber", serviceNumber);
process.LoggerInstance(logger);
api.LoggerInstance(logger);

const scope = nock(baseConfig.BaseUrl, reqHeaders);

describe("Ticket Creation - CreateFT", () => {
    describe("API Unit Test", () => {
        scope.post(url, reqBody).reply(200);
        it('[Status Code] 200', () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                expect(req.statusCode).to.equal(200);
            })
        });

        scope.post(url, reqBody).reply(400);
        it('[Status Code] 400', () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                expect(req.statusCode).to.equal(400);
            })
        });

        scope.post(url, reqBody).reply(500);
        it('[Status Code] 500', () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                expect(req.statusCode).to.equal(500);
            })
        });

        scope.post(url, reqBody).replyWithError({
            message: '{"errno":-3008,"code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"www.pldt.com.ph"}',
            code: 'ENOTFOUND',
        });
        it('[Status Code] ENOTFOUND', () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                expect(err.code).to.equal('ENOTFOUND');
            })
        });
    });

    describe("Process Flow SUCCESS Unit Test", () => {
        scope.post(url, reqBody).reply(mockdata.SuccessNullTNResponse.statusCode, mockdata.SuccessNullTNResponse.data);
        it(`[Status Code] 200, [Transition] SUCCESS, [Remarks] null ticket number`, () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                const result = process.CreateFTProcess(req.statusCode, req.body, accountNumber, serviceNumber, reportedBy, sysDate, false);
                expect(200).to.equal(req.statusCode);
                expect(result.Transition).to.equal('SUCCESS');
                expect(result.Variables.length).to.equal(2);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'spielMsg':
                            expect(element.value).to.equal(mockdata.SuccessNullTNResponse.data.spiel);
                            break;
                        case 'ticketNumber':
                            expect(element.value).to.equal(mockdata.SuccessNullTNResponse.data.ticketNumber);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.SuccessResponse.statusCode, mockdata.SuccessResponse.data);
        it(`[Status Code] 200, [Transition] SUCCESS`, () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                const result = process.CreateFTProcess(req.statusCode, req.body, accountNumber, serviceNumber, reportedBy, sysDate, false);
                expect(200).to.equal(req.statusCode);
                expect(result.Transition).to.equal('SUCCESS');
                expect(result.Variables.length).to.equal(2);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'spielMsg':
                            expect(element.value).to.equal(mockdata.SuccessResponse.data.spiel);
                            break;
                        case 'ticketNumber':
                            expect(element.value).to.equal(mockdata.SuccessResponse.data.ticketNumber);
                            break;
                    }
                });
            })
        });
    });

    describe("Process Flow ERROR Unit Test", () => {
        scope.post(url, reqBody).reply(404, mockdata.ErrorDefaultMsgResponse.data);
        it(`[Status Code] 404`, () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                const result = process.CreateFTProcess(req.statusCode, req.body, accountNumber, serviceNumber, reportedBy, sysDate, false);
                expect(404).to.equal(req.statusCode);
                expect(result.Transition).to.equal('500');
                expect(result.Variables.length).to.equal(0);
            })
        });

        scope.post(url, reqBody).reply(mockdata.Error406MsgResponse.statusCode, mockdata.Error406MsgResponse.data);
        it(`[Status Code] 406, [Message] ${mockdata.Error406MsgResponse.data.message}`, () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                const result = process.CreateFTProcess(req.statusCode, req.body, accountNumber, serviceNumber, reportedBy, sysDate, false);
                expect(406).to.equal(req.statusCode);
                expect(result.Transition).to.equal('FAILURE');
                expect(result.Variables.length).to.equal(1);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'spielMsg':
                            expect(element.value).to.equal(mockdata.Error406MsgResponse.data.message);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(mockdata.Error406SpielResponse.statusCode, mockdata.Error406SpielResponse.data);
        it(`[Status Code] 406, [Spiel] ${mockdata.Error406SpielResponse.data.spiel}`, () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                const result = process.CreateFTProcess(req.statusCode, req.body, accountNumber, serviceNumber, reportedBy, sysDate, false);
                expect(406).to.equal(req.statusCode);
                expect(result.Transition).to.equal('FAILURE');
                expect(result.Variables.length).to.equal(1);

                result.Variables.forEach(element => {
                    switch (element.name) {
                        case 'spielMsg':
                            expect(element.value).to.equal(mockdata.Error406SpielResponse.data.spiel);
                            break;
                    }
                });
            })
        });

        scope.post(url, reqBody).reply(408, mockdata.ErrorDefaultMsgResponse.data);
        it(`[Status Code] 408`, () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                const result = process.CreateFTProcess(req.statusCode, req.body, accountNumber, serviceNumber, reportedBy, sysDate, false);
                expect(408).to.equal(req.statusCode);
                expect(result.Transition).to.equal('FAILURE');
                expect(result.Variables.length).to.equal(0);
            })
        });

        scope.post(url, reqBody).reply(500, mockdata.ErrorDefaultMsgResponse.data);
        it(`[Status Code] 500`, () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                const result = process.CreateFTProcess(req.statusCode, req.body, accountNumber, serviceNumber, reportedBy, sysDate, false);
                expect(500).to.equal(req.statusCode);
                expect(result.Transition).to.equal('500');
                expect(result.Variables.length).to.equal(0);
            })
        });

        scope.post(url, reqBody).reply(502, mockdata.ErrorDefaultMsgResponse.data);
        it(`[Status Code] 502`, () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                const result = process.CreateFTProcess(req.statusCode, req.body, accountNumber, serviceNumber, reportedBy, sysDate, false);
                expect(502).to.equal(req.statusCode);
                expect(result.Transition).to.equal('FAILURE');
                expect(result.Variables.length).to.equal(0);
            })
        });

        scope.post(url, reqBody).reply(599, mockdata.ErrorDefaultMsgResponse.data);
        it(`[Status Code] 599`, () => {
            api.PostRequest(reqBody, 0, (err, req) => {
                const result = process.CreateFTProcess(req.statusCode, req.body, accountNumber, serviceNumber, reportedBy, sysDate, false);
                expect(599).to.equal(req.statusCode);
                expect(result.Transition).to.equal('FAILURE');
                expect(result.Variables.length).to.equal(0);
            })
        });
    });
});