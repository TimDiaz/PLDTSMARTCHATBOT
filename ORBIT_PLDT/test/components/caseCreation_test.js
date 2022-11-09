"use strict";

const component = require('../../components/caseCreation/caseCreation');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let param_notexist = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "00230872789"
    }
)
let param_exist = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0222420741",
        "serviceNumber": "0333205890",
        "message": "testCaseCreationFromOrbit",
        "customerCity": "ILO - ILOILO CITY",
        "firstName": "Richelle",
        "lastName": "Raby",
        "subMenu": "Request Copy of Bill",
        "skillName": "Billing Services",
        "RecordTypeId": "0122u000000GqsY",
        "Subject": "PLDT Ordertaking - Billing Services"
    }
)

async function Run() {
    // await customComponent.invoke("caseCreation", param_notexist, component);
    await customComponent.invoke("CaseCreation", param_exist, component);
};

Run();