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

const url = `/amdocs/api/sendeSOA/${serviceNumber}/1`;
const reqHeaders = {
    reqheaders: {
        'X-Pldt-Auth-Token': baseConfig.SwitchToken,
        'Cookie': baseConfig.SwitchCookies
    }
};
const month = 'Current Month';

logger.addContext("serviceNumber", serviceNumber);
process.LoggerInstance(logger);
api.LoggerInstance(logger);

const scope = nock(baseConfig.SwitchURL, reqHeaders);
describe("Billing Services - Auto eSoa", () => {
    scope.get(url).reply(200);
    it('[Status Code] 200, [Transition] success', () => {
        api.AutoESoaRequest(serviceNumber, month, (err, req) => {
            const result = process.AutoESoaProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

            expect(req.statusCode).to.equal(200);
            expect(result.Transition).to.equal('success');
        })
    });

    scope.get(url).reply(402);
    it('[Status Code] 402, [Transition] invalidparam', () => {
        api.AutoESoaRequest(serviceNumber, month, (err, req) => {
            const result = process.AutoESoaProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

            expect(req.statusCode).to.equal(402);
            expect(result.Transition).to.equal('invalidparam');
        })
    });

    scope.get(url).reply(403);
    it('[Status Code] 403, [Transition] InvalidEmail', () => {
        api.AutoESoaRequest(serviceNumber, month, (err, req) => {
            const result = process.AutoESoaProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

            expect(req.statusCode).to.equal(403);
            expect(result.Transition).to.equal('InvalidEmail');
        })
    });

    scope.get(url).reply(404);
    it('[Status Code] 404, [Transition] invalidBillingDate', () => {
        api.AutoESoaRequest(serviceNumber, month, (err, req) => {
            const result = process.AutoESoaProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

            expect(req.statusCode).to.equal(404);
            expect(result.Transition).to.equal('invalidBillingDate');
        })
    });

    scope.get(url).reply(400);
    it('[Status Code] 400, [Transition] failed', () => {
        api.AutoESoaRequest(serviceNumber, month, (err, req) => {
            const result = process.AutoESoaProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

            expect(req.statusCode).to.equal(400);
            expect(result.Transition).to.equal('failed');
        })
    });

    scope.get(url,).reply(500);
    it('[Status Code] 500, [Transition] failed', () => {
        api.AutoESoaRequest(serviceNumber, month, (err, req) => {
            const result = process.AutoESoaProcess(req.statusCode, req.body, "NO DATA", serviceNumber, false);

            expect(req.statusCode).to.equal(500);
            expect(result.Transition).to.equal('failed');
        })
    });

    scope.get(url).replyWithError({
        message: '{"errno":-3008,"code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"www.pldt.com.ph"}',
        code: 'ENOTFOUND',
    });
    
    it('[Status Code] ENOTFOUND', () => {
        api.AutoESoaRequest(serviceNumber, month, (err, req) => {
            expect(err.code).to.equal('ENOTFOUND');
        })
    });
})