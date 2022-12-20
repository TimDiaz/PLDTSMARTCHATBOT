const nock = require('nock');
const expect = require('chai').expect;
const baseConfig = require('../../../configurations/base_config');
const process = require('../../../businesslogics/eligibility_logic');
const mockdata = require('../../mockData/AccountEligibility_mockdata');
const api = require('../../../http/accountEligibility_http');
const globalProp = require('../../../helpers/globalProperties');
const instance = require("../../../helpers/logger");
const _logger = instance.logger(globalProp.Logger.Category.AccountEligibility);
const logger = _logger.getLogger();

const serviceNumber = '0344320027';

//TURN OFF LOGGING WHILE UNIT TESTING
logger.level = 'off';

const url = `/amdocs/api/account/eligibility/${serviceNumber}`;
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

describe("Account Eligibility", () => {
    describe("API Unit Test", () => {
        scope.get(url).reply(mockdata.EligibleResponse.statusCode, mockdata.EligibleResponse.data);
        it('[Status Code] 200, [Eligible] true', () => {
            api.GetRequest(serviceNumber, (err, req) => {
                expect(req.statusCode).to.equal(200);
                expect(JSON.parse(req.body).eligible).to.equal(true);
            })
        });

        scope.get(url).reply(mockdata.NotEligibleResponse.statusCode, mockdata.NotEligibleResponse.data);
        it('[Status Code] 200, [Eligible] false', () => {
            api.GetRequest(serviceNumber, (err, req) => {
                expect(req.statusCode).to.equal(200);
                expect(JSON.parse(req.body).eligible).to.equal(false);
            })
        });

        scope.get(url).reply(500);
        it('[Status Code] 500, [Eligible] false', () => {
            api.GetRequest(serviceNumber, (err, req) => {
                expect(req.statusCode).to.equal(500);
            })
        });

        scope.get(url).replyWithError(mockdata.Error.ENOTFOUND);
        it('[Status Code] ENOTFOUND', () => {
            api.GetRequest(serviceNumber, (err, req) => {
                expect(err.code).to.equal('ENOTFOUND');
            })
        });
    });

    describe("Process Flow SUCCESS Unit Test", () => {
        scope.get(url).reply(mockdata.EligibleResponse.statusCode, mockdata.EligibleResponse.data);
        it('[Status Code] 200, [Eligible] true', () => {
            api.GetRequest(serviceNumber, (err, req) => {
                const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                expect(req.statusCode).to.equal(200);
                expect(result.Transition).to.equal('eligible');
            })
        });

        describe("Under Treatment", () => {
            scope.get(url).reply(mockdata.Types.UnderTreatment.statusCode, mockdata.Types.UnderTreatment.data);
            it('[Status Code] 200, [Eligible] false', () => {
                api.GetRequest(serviceNumber, (err, req) => {
                    const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                    expect(req.statusCode).to.equal(200);
                    expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.UnderTreatment.Conversation.Transition);
                    expect(result.Variables.length).to.equal(1);

                    result.Variables.forEach(element => {
                        switch (element.name) {
                            case 'ineligibleAcctmsg':
                                expect(element.value).to.equal(mockdata.Types.UnderTreatment.data.spiel);
                                break;
                        }
                    });
                })
            });
        });

        describe("With Open Repair Ticket", () => {
            describe("PARENT", () => {
                scope.get(url).reply(mockdata.Types.WithOpenRepairTicket.Tier.Parent.VC.statusCode, mockdata.Types.WithOpenRepairTicket.Tier.Parent.VC.data);
                it('[Status Code] 200, [Eligible] false, [Type] VOLUME COMPLAINT', () => {
                    api.GetRequest(serviceNumber, (err, req) => {
                        const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                        expect(req.statusCode).to.equal(200);
                        expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Parent.TicketTypes.VC.Conversation.Transition);
                        expect(result.Variables.length).to.equal(2);

                        result.Variables.forEach(element => {
                            switch (element.name) {
                                case 'ticketNumber':
                                    expect(element.value).to.equal(mockdata.Types.WithOpenRepairTicket.Tier.Parent.VC.data.PROM_NUMBER);
                                    break;
                                case 'ParentType':
                                    expect(element.value).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Parent.TicketTypes.VC.Name);
                                    break;
                            }
                        });
                    })
                });

                scope.get(url).reply(mockdata.Types.WithOpenRepairTicket.Tier.Parent.CR.statusCode, mockdata.Types.WithOpenRepairTicket.Tier.Parent.CR.data);
                it('[Status Code] 200, [Eligible] false, [Type] CR', () => {
                    api.GetRequest(serviceNumber, (err, req) => {
                        const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                        expect(req.statusCode).to.equal(200);
                        expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Parent.TicketTypes.CR.Conversation.Transition);
                        expect(result.Variables.length).to.equal(2);

                        result.Variables.forEach(element => {
                            switch (element.name) {
                                case 'ticketNumber':
                                    expect(element.value).to.equal(mockdata.Types.WithOpenRepairTicket.Tier.Parent.CR.data.PROM_NUMBER);
                                    break;
                                case 'ParentType':
                                    expect(element.value).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Parent.TicketTypes.CR.Name);
                                    break;
                            }
                        });
                    })
                });

                scope.get(url).reply(mockdata.Types.WithOpenRepairTicket.Tier.Parent.Default.statusCode, mockdata.Types.WithOpenRepairTicket.Tier.Parent.Default.data);
                it('[Status Code] 200, [Eligible] false, [Type] Default', () => {
                    api.GetRequest(serviceNumber, (err, req) => {
                        const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                        expect(req.statusCode).to.equal(200);
                        expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Parent.TicketTypes.Default.Conversation.Transition);
                        expect(result.Variables.length).to.equal(2);

                        result.Variables.forEach(element => {
                            switch (element.name) {
                                case 'ticketNumber':
                                    expect(element.value).to.equal(mockdata.Types.WithOpenRepairTicket.Tier.Parent.Default.data.PROM_NUMBER);
                                    break;
                                case 'ParentType':
                                    expect(element.value).to.equal('TT,SQDT,PDT');
                                    break;
                            }
                        });
                    })
                });
            });

            describe("CHILD", () => {
                scope.get(url).reply(mockdata.Types.WithOpenRepairTicket.Tier.Child.statusCode, mockdata.Types.WithOpenRepairTicket.Tier.Child.data);
                it('[Status Code] 200, [Eligible] false', () => {
                    api.GetRequest(serviceNumber, (err, req) => {
                        const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                        expect(req.statusCode).to.equal(200);
                        expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Child.TicketTypes.Conversation.Transition);
                        expect(result.Variables.length).to.equal(1);

                        result.Variables.forEach(element => {
                            switch (element.name) {
                                case 'ticketNumber':
                                    expect(element.value).to.equal(mockdata.Types.WithOpenRepairTicket.Tier.Child.data.PROM_NUMBER);
                                    break;
                            }
                        });
                    })
                });
            });

            describe("Default", () => {
                scope.get(url).reply(mockdata.Types.WithOpenRepairTicket.Tier.Default.InitialDiagnosis.statusCode, mockdata.Types.WithOpenRepairTicket.Tier.Default.InitialDiagnosis.data);
                it('[Status Code] 200, [Eligible] false, [Spiel] InitialDiagnosis', () => {
                    api.GetRequest(serviceNumber, (err, req) => {
                        const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                        expect(req.statusCode).to.equal(200);
                        expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Conversation.Transition);
                        expect(result.Variables.length).to.equal(2);

                        result.Variables.forEach(element => {
                            switch (element.name) {
                                case 'ticketNumber':
                                    expect(element.value).to.equal(mockdata.Types.WithOpenRepairTicket.Tier.Default.InitialDiagnosis.data.PROM_NUMBER);
                                    break;
                                case 'indiTicketSpiel':
                                    expect(element.value).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Types.InitialDiagnosis.PromWordSpiel.replace('${ticketNumber}', mockdata.Types.WithOpenRepairTicket.Tier.Default.InitialDiagnosis.data.PROM_NUMBER));
                                    break;
                            }
                        });
                    })
                });

                scope.get(url).reply(mockdata.Types.WithOpenRepairTicket.Tier.Default.Testing.statusCode, mockdata.Types.WithOpenRepairTicket.Tier.Default.Testing.data);
                it('[Status Code] 200, [Eligible] false, [Spiel] Testing', () => {
                    api.GetRequest(serviceNumber, (err, req) => {
                        const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                        expect(req.statusCode).to.equal(200);
                        expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Conversation.Transition);
                        expect(result.Variables.length).to.equal(2);

                        result.Variables.forEach(element => {
                            switch (element.name) {
                                case 'ticketNumber':
                                    expect(element.value).to.equal(mockdata.Types.WithOpenRepairTicket.Tier.Default.Testing.data.PROM_NUMBER);
                                    break;
                                case 'indiTicketSpiel':
                                    expect(element.value).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Types.Testing.PromWordSpiel);
                                    break;
                            }
                        });
                    })
                });

                scope.get(url).reply(mockdata.Types.WithOpenRepairTicket.Tier.Default.Dispatched.statusCode, mockdata.Types.WithOpenRepairTicket.Tier.Default.Dispatched.data);
                it('[Status Code] 200, [Eligible] false, [Spiel] Dispatched', () => {
                    api.GetRequest(serviceNumber, (err, req) => {
                        const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                        expect(req.statusCode).to.equal(200);
                        expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Conversation.Transition);
                        expect(result.Variables.length).to.equal(2);

                        result.Variables.forEach(element => {
                            switch (element.name) {
                                case 'ticketNumber':
                                    expect(element.value).to.equal(mockdata.Types.WithOpenRepairTicket.Tier.Default.Dispatched.data.PROM_NUMBER);
                                    break;
                                case 'indiTicketSpiel':
                                    expect(element.value).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Types.Dispatched.PromWordSpiel.replace('${ticketNumber}', mockdata.Types.WithOpenRepairTicket.Tier.Default.Dispatched.data.PROM_NUMBER));
                                    break;
                            }
                        });
                    })
                });

                scope.get(url).reply(mockdata.Types.WithOpenRepairTicket.Tier.Default.FurtherTesting.statusCode, mockdata.Types.WithOpenRepairTicket.Tier.Default.FurtherTesting.data);
                it('[Status Code] 200, [Eligible] false, [Spiel] FurtherTesting', () => {
                    api.GetRequest(serviceNumber, (err, req) => {
                        const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                        expect(req.statusCode).to.equal(200);
                        expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Conversation.Transition);
                        expect(result.Variables.length).to.equal(2);

                        result.Variables.forEach(element => {
                            switch (element.name) {
                                case 'ticketNumber':
                                    expect(element.value).to.equal(mockdata.Types.WithOpenRepairTicket.Tier.Default.FurtherTesting.data.PROM_NUMBER);
                                    break;
                                case 'indiTicketSpiel':
                                    expect(element.value).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Types.FurtherTesting.PromWordSpiel);
                                    break;
                            }
                        });
                    })
                });

                scope.get(url).reply(mockdata.Types.WithOpenRepairTicket.Tier.Default.Resolved.statusCode, mockdata.Types.WithOpenRepairTicket.Tier.Default.Resolved.data);
                it('[Status Code] 200, [Eligible] false, [Spiel] Resolved', () => {
                    api.GetRequest(serviceNumber, (err, req) => {
                        const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                        expect(req.statusCode).to.equal(200);
                        expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Conversation.Transition);
                        expect(result.Variables.length).to.equal(2);

                        result.Variables.forEach(element => {
                            switch (element.name) {
                                case 'ticketNumber':
                                    expect(element.value).to.equal(mockdata.Types.WithOpenRepairTicket.Tier.Default.Resolved.data.PROM_NUMBER);
                                    break;
                                case 'indiTicketSpiel':
                                    expect(element.value).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Types.Resolved.PromWordSpiel);
                                    break;
                            }
                        });
                    })
                });

                scope.get(url).reply(mockdata.Types.WithOpenRepairTicket.Tier.Default.Default.statusCode, mockdata.Types.WithOpenRepairTicket.Tier.Default.Default.data);
                it('[Status Code] 200, [Eligible] false, [Spiel] Default', () => {
                    api.GetRequest(serviceNumber, (err, req) => {
                        const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                        expect(req.statusCode).to.equal(200);
                        expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Conversation.Transition);
                        expect(result.Variables.length).to.equal(2);

                        result.Variables.forEach(element => {
                            switch (element.name) {
                                case 'ticketNumber':
                                    expect(element.value).to.equal(mockdata.Types.WithOpenRepairTicket.Tier.Default.Default.data.PROM_NUMBER);
                                    break;
                                case 'indiTicketSpiel':
                                    expect(element.value).to.equal(globalProp.AccountEligibility.Types.WithOpenRepairTicket.Tier.Default.Types.Deafult.PromWordSpiel.replace('${ticketNumber}', mockdata.Types.WithOpenRepairTicket.Tier.Default.Default.data.PROM_NUMBER));
                                    break;
                            }
                        });
                    })
                });
            });
        });

        describe("Invalid service number", () => {
            scope.get(url).reply(mockdata.Types.InvalidServiceNumber.statusCode, mockdata.Types.InvalidServiceNumber.data);
            it('[Status Code] 200, [Eligible] false', () => {
                api.GetRequest(serviceNumber, (err, req) => {
                    const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                    expect(req.statusCode).to.equal(200);
                    expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.InvalidServiceNumber.Conversation.Transition);
                })
            });
        });

        describe("With Open SO", () => {
            scope.get(url).reply(mockdata.Types.WithOpenSO.WithDigits.statusCode, mockdata.Types.WithOpenSO.WithDigits.data);
            it('[Status Code] 200, [Eligible] false, [With Digits] false', () => {
                api.GetRequest(serviceNumber, (err, req) => {
                    const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                    expect(req.statusCode).to.equal(200);
                    expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenSO.Conversation.Transition);
                    expect(result.Variables.length).to.equal(2);

                    result.Variables.forEach(element => {
                        switch (element.name) {
                            case 'ineligibleAcctmsg':
                                expect(element.value).to.equal(mockdata.Types.WithOpenSO.WithDigits.data.spiel);
                                break;
                            case 'openSONumber':
                                expect(element.value).to.equal('987654321');
                                break;
                        }
                    });
                })
            });

            scope.get(url).reply(mockdata.Types.WithOpenSO.NoDigits.statusCode, mockdata.Types.WithOpenSO.NoDigits.data);
            it('[Status Code] 200, [Eligible] false, [With Digits] true', () => {
                api.GetRequest(serviceNumber, (err, req) => {
                    const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                    expect(req.statusCode).to.equal(200);
                    expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenSO.Conversation.Transition);
                    expect(result.Variables.length).to.equal(2);
                    
                    result.Variables.forEach(element => {
                        switch (element.name) {
                            case 'ineligibleAcctmsg':
                                expect(element.value).to.equal(mockdata.Types.WithOpenSO.NoDigits.data.spiel);
                                break;
                            case 'openSONumber':
                                expect(element.value).to.equal('undefined');
                                break;
                        }
                    });
                })
            });
        });

        describe("With Open Transfer SO", () => {
            scope.get(url).reply(mockdata.Types.WithOpenTransferSO.statusCode, mockdata.Types.WithOpenTransferSO.data);
            it('[Status Code] 200, [Eligible] false', () => {
                api.GetRequest(serviceNumber, (err, req) => {
                    const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                    expect(req.statusCode).to.equal(200);
                    expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.WithOpenTransferSO.Conversation.Transition);
                    expect(result.Variables.length).to.equal(2);

                    result.Variables.forEach(element => {
                        switch (element.name) {
                            case 'ineligibleAcctmsg':
                                expect(element.value).to.equal(mockdata.Types.WithOpenTransferSO.data.spiel);
                                break;
                            case 'openSONumber':
                                expect(element.value[0]).to.equal('987654321');
                                break;
                        }
                    });
                })
            });
        });

        describe("Account is not RBG", () => {
            scope.get(url).reply(mockdata.Types.AccountIsNotRBG.statusCode, mockdata.Types.AccountIsNotRBG.data);
            it('[Status Code] 200, [Eligible] false', () => {
                api.GetRequest(serviceNumber, (err, req) => {
                    const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                    expect(req.statusCode).to.equal(200);
                    expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.AccountIsNotRBG.Conversation.Transition);
                    expect(result.Variables.length).to.equal(1);

                    result.Variables.forEach(element => {
                        switch (element.name) {
                            case 'ineligibleAcctmsg':
                                expect(element.value).to.equal(mockdata.Types.AccountIsNotRBG.data.spiel);
                                break;
                        }
                    });
                })
            });
        });

        describe("Open Order", () => {
            scope.get(url).reply(mockdata.Types.OpenOrder.statusCode, mockdata.Types.OpenOrder.data);
            it('[Status Code] 200, [Eligible] false', () => {
                api.GetRequest(serviceNumber, (err, req) => {
                    const result = process.Process(req.statusCode, req.body, "NO DATA", serviceNumber, false);

                    expect(req.statusCode).to.equal(200);
                    expect(result.Transition).to.equal(globalProp.AccountEligibility.Types.OpenOrder.Conversation.Transition);
                    expect(result.Variables.length).to.equal(2);

                    result.Variables.forEach(element => {
                        switch (element.name) {
                            case 'ineligibleAcctmsg':
                                expect(element.value).to.equal(mockdata.Types.OpenOrder.data.spiel);
                                break;
                            case 'openSONumber':
                                expect(element.value[0]).to.equal('987654321');
                                break;
                        }
                    });
                })
            });
        });
    });

    describe("Process Flow ERROR Unit Test", () => {
        scope.get(url).reply(408);
        it(`[Status Code] 408`, () => {
            api.GetRequest(serviceNumber, (err, req) => {
                const result = process.ErrorResponse(req.statusCode).Message.replace('${code}', req.statusCode);
                expect(result).to.equal(mockdata.Error.Error408.message.replace('${code}', req.statusCode));
            })
        });

        scope.get(url).reply(500);
        it(`[Status Code] 500`, () => {
            api.GetRequest(serviceNumber, (err, req) => {
                const result = process.ErrorResponse(req.statusCode).Message.replace('${code}', req.statusCode);
                expect(result).to.equal(mockdata.Error.Error500.message.replace('${code}', req.statusCode));
            })
        });

        scope.get(url).reply(502);
        it(`[Status Code] 502`, () => {
            api.GetRequest(serviceNumber, (err, req) => {
                const result = process.ErrorResponse(req.statusCode).Message.replace('${code}', req.statusCode);
                expect(result).to.equal(mockdata.Error.Error502.message.replace('${code}', req.statusCode));
            })
        });

        scope.get(url).reply(599);
        it(`[Status Code] 599`, () => {
            api.GetRequest(serviceNumber, (err, req) => {
                const result = process.ErrorResponse(req.statusCode).Message.replace('${code}', req.statusCode);
                expect(result).to.equal(mockdata.Error.Error599.message.replace('${code}', req.statusCode));
            })
        });

        scope.get(url).reply(503);
        it(`[Status Code] Default`, () => {
            api.GetRequest(serviceNumber, (err, req) => {
                const result = process.ErrorResponse(req.statusCode).Message.replace('${code}', req.statusCode);
                expect(result).to.equal(mockdata.Error.ErrorDefault.message.replace('${code}', req.statusCode));
            })
        });
    });
});