"use strict";

const component = require('../../components/fmGetFTDetails/checkStype');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let checkSType_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0344320027",
        "serviceNumber": "0023087278"
    }
)
let checkSType_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0023087278",
        "serviceNumber": "0344320027"
    }
)

async function Run() {
    // await customComponent.invoke("validateServiceNumberFormat", checkSType_notmatch, component);
    await customComponent.invoke("checkSType", checkSType_match, component);
};

Run();