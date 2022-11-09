"use strict";

const component = require('../../components/caseCreation/chatAdCaseCreate');
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
        "message": "testChatADCaseCreationFromOrbit",
        "customerCity": "ILO - ILOILO CITY",
        "firstName": "Richelle",
        "lastName": "Raby",
        "subMenu": "Upgrade Plan - FIBR PLUS - 2399",
        "skillName": "Account Services",
        "RecordTypeId": "0121s0000004kkJ",
        "Subject": "PLDT Order Taking - Account Services",
        "Chat_Ad_ID__c": "AD_0011223344"
    }
)

async function Run() {
    // await customComponent.invoke("caseCreation", param_notexist, component);
    await customComponent.invoke("CaseCreation", param_exist, component);
};

Run();