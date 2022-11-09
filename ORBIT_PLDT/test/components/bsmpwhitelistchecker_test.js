"use strict";

const component = require('../../components/smp/bsmpwhitelistchecker');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let bsmpwhitelistchecker_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0344320027",
        "serviceNumber": "0023087278"
    }
)
let bsmpwhitelistchecker_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "Mobile": "0282426628"
    }
)

async function Run() {
    // await customComponent.invoke("validateServiceNumberFormat", accountValidation_notmatch, component);
    await customComponent.invoke("bsmpwhitelistchecker", bsmpwhitelistchecker_match, component);
};

Run();