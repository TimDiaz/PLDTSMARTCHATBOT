"use strict";

const component = require('../../components/accountValidation/validateFormats/checkMobileFormat');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let mobilevalidation_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0344320027",
        "serviceNumber": "0023087278"
    }
)
let mobilevalidation_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "mobile": "+639178929829"
    }
)

async function Run() {
    // await customComponent.invoke("validateServiceNumberFormat", accountValidation_notmatch, component);
    await customComponent.invoke("mobilevalidation", mobilevalidation_match, component);
};

Run();