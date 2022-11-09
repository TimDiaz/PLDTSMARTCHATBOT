"use strict";

const component = require('../../components/fmGetFTDetails/fmInternet');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let fmInternet_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0344320027",
        "serviceNumber": "0023087278"
    }
)
let fmInternet_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0023087278",
        "serviceNumber": "0344320027"
    }
)

async function Run() {
    // await customComponent.invoke("validateServiceNumberFormat", fmInternet_notmatch, component);
    await customComponent.invoke("fmInternet", fmInternet_match, component);
};

Run();