"use strict";

const component = require('../../components/billingServices/autoCheckBalance/autoesoa');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let autobal_notmatch = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "0286631146",
        "monthBill": "1"
    }
)
let autobal_match = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "0286631146",
        "monthBill": "1"
    }
)

async function Run() {
    // await customComponent.invoke("validateServiceNumberFormat", accountValidation_notmatch, component);
    await customComponent.invoke("autoesoa", autobal_match, component);
};

Run();