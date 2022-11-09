"use strict";

const component = require('../../components/ticketCreation/ticketcreationcreateft');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let ticketCreation_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "description": "DISPATCH_OUTSIDE_COPPER CHECK FOR MISSING MICRO-FILTER [LSCODE: 2132]",
        "empeId": "MOBILEIT",
        "faultType": "RBG-CRT",
        "priority": "5",
        "promCause": "100",
        "reportedBy": "CHATBOT_LM",
        "serviceNumber": "0538320051",
         "promSubType": "VD-NO VOICE AND DATA",
         "promWorgName": "IVRS",
         "promCategory": "LAST MILE",
         "promSubCategory": "FAILED SNR/LA/LONG LOOP - COPPER"

    }
)
let ticketCreation_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "description": "DISPATCH_OUTSIDE_COPPER CHECK FOR MISSING MICRO-FILTER [LSCODE: 2132]",
        "empeId": "MOBILEIT",
        "faultType": "RBG-CRT",
        "priority": "5",
        "promCause": "100",
        "reportedBy": "CHATBOT_LM",
        "serviceNumber": "0538320051",
        "promSubType": "VD-NO VOICE AND DATA",
        "promWorgName": "IVRS",
         "promCategory": "LAST MILE",
         "promSubCategory": "FAILED SNR/LA/LONG LOOP - COPPER"
    }
)

async function Run() {
    // await customComponent.invoke("validateServiceNumberFormat", ticketCreation_notmatch, component);
    await customComponent.invoke("ticketCreationFT", ticketCreation_match, component);
};

Run();