"use strict";

const component = require('../../components/fmGetFTDetails/fmLandline');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let fmLandline_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0344320027",
        "serviceNumber": "0023087278"
    }
)
let fmLandline_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0023087278",
        "serviceNumber": "0344320027"
    }
)

async function Run() {
    // await customComponent.invoke("validateServiceNumberFormat", fmLandline_notmatch, component);
    await customComponent.invoke("fmLandline", fmLandline_match, component);
};

Run();