"use strict";

const component = require('../../components/accountEligibility/tsEligibility');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let tsEligibility_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "0023087278"
    }
)
let tsEligibility_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "0344320027"
    }
)

async function Run() {
    // await customComponent.invoke("tsEligibility", tsEligibility_match, component);
    await customComponent.invoke("tsEligibility", tsEligibility_notmatch, component);
};

Run();