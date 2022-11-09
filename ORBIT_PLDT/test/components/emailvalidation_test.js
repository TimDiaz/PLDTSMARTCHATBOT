"use strict";

const component = require('../../components/accountValidation/validateFormats/checkEmailFormat');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let emailvalidation_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0344320027",
        "serviceNumber": "0023087278"
    }
)
let emailvalidation_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "email": "t-asxsupplier.smart.com.ph"
    }
)

async function Run() {
    // await customComponent.invoke("validateServiceNumberFormat", accountValidation_notmatch, component);
    await customComponent.invoke("emailvalidation", emailvalidation_match, component);
};

Run();