"use strict";

const component = require('../../components/billingServices/autoCheckBalance/autobal');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let autobal_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0344320027",
        "serviceNumber": "0023087278"
    }
)
let autobal_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0023087278",
        "serviceNumber": "0344320027"
    }
)

async function Run() {
    // await customComponent.invoke("validateServiceNumberFormat", accountValidation_notmatch, component);
    await customComponent.invoke("autobal", autobal_match, component);
};

Run();