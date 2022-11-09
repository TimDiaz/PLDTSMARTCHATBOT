"use strict";

const component = require('../../components/smp/bsmpchecker');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let bsmpchecker_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0344320027",
        "serviceNumber": "0023087278"
    }
)
let bsmpchecker_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "Mobile": "0285849326",
        "sysDate": "1664183396357"
    }
)

async function Run() {
    // await customComponent.invoke("validateServiceNumberFormat", bsmpchecker_notmatch, component);
    await customComponent.invoke("bsmpwhitelistchecker", bsmpchecker_match, component);
};

Run();