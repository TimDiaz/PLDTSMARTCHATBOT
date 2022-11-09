"use strict";

const component = require('../../components/caseCreation/followupCase');
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
        "message": "testFollowUpCaseCreationFromOrbit",
        "customerCity": "ILO - ILOILO CITY",
        "firstName": "Richelle",
        "lastName": "Raby",
        "subMenu": "Follow-up Relocation",
        "skillName": "Follow-up",
        "RecordTypeId": "0122u000000GqxR",
        "Subject": "Follow-up Relocation [VL]"
    }
)

async function Run() {
    // await customComponent.invoke("caseCreation", param_notexist, component);
    await customComponent.invoke("FollowUpCase", param_exist, component);
};

Run();