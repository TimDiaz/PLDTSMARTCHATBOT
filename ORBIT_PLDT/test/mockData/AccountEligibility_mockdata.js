const EligibleResponse = {
    statusCode: 200,
    data: {
        "eligible": true,
        "message": null,
        "spiel": null,
        "PROL_PROM_NUMBER": null,
        "PROL_FOREIGNID": null,
        "PROM_NUMBER": null,
        "PROM_CREATED": null,
        "PROM_WORG_NAME": null,
        "PROM_CAUSE": null,
        "PROM_TYPE": null,
        "PROM_ACKNOWLEDGEDBY": null,
        "SERVICE_ID": null,
        "SERVICE_TYPE": null,
        "PARENT_FAULTTYPE": null,
        "PARENT_WG": null,
        "PROM_RELATION": null,
        "DEVICENAME": null,
        "AREA_AFFECTED": null,
        "TIME_OF_OCCURRENCE": null,
        "ESTIMATED_TARGET_DATE_OF_RESTO": null,
        "POTENTIAL_SERV_AFFCTD": null,
        "VSDT_TICKET_TYPE": null,
        "VSDT_SUB_TICKET_TYPE": null,
        "ACTIVITY_TYPE": null,
        "CR_PROJECTED_OUTAGE_START": null,
        "CR_PROJECTED_OUTAGE_END": null
    }
}

const NotEligibleResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "Your reported concern with reference number 9771956||RBG-CRT|BAT_OPSIM is still being addressed. We will give you an update at the soonest possible. Thank you",
        "PROL_PROM_NUMBER": "9771956",
        "PROL_FOREIGNID": "0437560110",
        "PROM_NUMBER": "9771956",
        "PROM_CREATED": "2022-11-25T15:15:09+08:00",
        "PROM_WORG_NAME": "BAT_OPSIM",
        "PROM_CAUSE": "101",
        "PROM_TYPE": "RBG-CRT",
        "PROM_ACKNOWLEDGEDBY": "",
        "SERVICE_ID": "0437560110",
        "SERVICE_TYPE": "POTS POSTPAID",
        "PARENT_FAULTTYPE": "",
        "PARENT_WG": "",
        "PROM_RELATION": "",
        "DEVICENAME": "",
        "AREA_AFFECTED": "",
        "TIME_OF_OCCURRENCE": "",
        "ESTIMATED_TARGET_DATE_OF_RESTO": "",
        "POTENTIAL_SERV_AFFCTD": "",
        "VSDT_TICKET_TYPE": "",
        "VSDT_SUB_TICKET_TYPE": "",
        "ACTIVITY_TYPE": "",
        "CR_PROJECTED_OUTAGE_START": "",
        "CR_PROJECTED_OUTAGE_END": ""
    }
}

const UnderTreatment = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "Under Treatment.",
        "spiel": "Under Treatment",
        "PROM_NUMBER": "0000000",
    }
}
const InvalidServiceNumber = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "Invalid service number",
        "spiel": "Invalid service number",
        "PROM_NUMBER": "0000000",
    }
}
const WithOpenSO = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open SO.",
        "spiel": "With Open SO 987654321",
        "PROM_NUMBER": "0000000",
    }
}
const NoDigitsWithOpenSO = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open SO.",
        "spiel": "With Open SO No DIGITS",
        "PROM_NUMBER": "0000000",
    }
}
const WithOpenTransferSO = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Transfer SO.",
        "spiel": "With Open Transfer SO 987654321",
        "PROM_NUMBER": "0000000",
    }
}
const AccountIsNotRBG = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "Account is not RBG.",
        "spiel": "Account is not RBG",
        "PROM_NUMBER": "0000000",
    }
}
const OpenOrder = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "openorder",
        "spiel": "Open Order 987654321",
        "PROM_NUMBER": "0000000",
    }
}

const WORT_ParentVCResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "0000000|PARENT|VOLUME COMPLAINT",
        "PROM_NUMBER": "0000000",
    }
}
const WORT_ParentCRResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "0000000|PARENT|CR",
        "PROM_NUMBER": "0000000",
    }
}
const WORT_ParentDefaultResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "0000000|PARENT|TT|SQDT|PDT",
        "PROM_NUMBER": "0000000",
    }
}

const WORT_ChildResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "0000000|CHILD",
        "PROM_NUMBER": "0000000",
    }
}

const WORT_InitialDiagnosisResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "0000000|SUB_HOMECARE",
        "PROM_NUMBER": "0000000",
    }
}
const WORT_TestingResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "0000000|TECHRES-FRD",
        "PROM_NUMBER": "0000000",
    }
}
const WORT_DispatchedResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "0000000|BAT_OPSIM",
        "PROM_NUMBER": "0000000",
    }
}
const WORT_FurtherTestingResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "0000000|BZ-MCT",
        "PROM_NUMBER": "0000000",
    }
}
const WORT_ResolvedResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "0000000|FM_POLL",
        "PROM_NUMBER": "0000000",
    }
}
const WORT_DeafultResponse = {
    statusCode: 200,
    data: {
        "eligible": false,
        "message": "With Open Repair Ticket.",
        "spiel": "0000000|",
        "PROM_NUMBER": "0000000",
    }
}

const Error = {
    ENOTFOUND: {
        message: '{"errno":-3008,"code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"www.pldt.com.ph"}',
        code: 'ENOTFOUND',
    },
    Error500:{
        message: '[ERROR CODE: ${code}] Internal Server Error Ecountered, Please try a different account.'
    },
    Error408:{
        message: '[ERROR CODE: ${code}] Request Time out, Please try again later.'
    },
    Error502:{
        message: '[ERROR CODE: ${code}] Bad Gateway Error, Please try again later.'
    },
    Error599:{
        message: '[ERROR CODE: ${code}] Network Connect Timeout Error, Please try again later.'
    },
    ErrorDefault:{
        message: '[ERROR CODE: ${code}] OOPS, Error Happened! Contact Administrator.'
    }
}

module.exports = {
    EligibleResponse: EligibleResponse,
    NotEligibleResponse: NotEligibleResponse,
    Types:{
        UnderTreatment: UnderTreatment,
        WithOpenRepairTicket: {
            Tier:{
                Parent:{
                    VC: WORT_ParentVCResponse,
                    CR: WORT_ParentCRResponse,
                    Default: WORT_ParentDefaultResponse
                },
                Child: WORT_ChildResponse,
                Default:{
                    InitialDiagnosis: WORT_InitialDiagnosisResponse,
                    Testing: WORT_TestingResponse,
                    Dispatched: WORT_DispatchedResponse,
                    FurtherTesting: WORT_FurtherTestingResponse,
                    Resolved: WORT_ResolvedResponse,
                    Default: WORT_DeafultResponse
                }
            }
        },
        InvalidServiceNumber: InvalidServiceNumber,
        WithOpenSO: { NoDigits: NoDigitsWithOpenSO, WithDigits: WithOpenSO },
        WithOpenTransferSO: WithOpenTransferSO,
        AccountIsNotRBG: AccountIsNotRBG,
        OpenOrder: OpenOrder
    },
    Error: Error
}