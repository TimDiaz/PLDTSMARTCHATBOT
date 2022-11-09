"use strict";

const component = require('../../components/accountValidation/validateFormats/validateServiceNumberFormat');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let validateServiceNumberFormat_alpanumeric = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "0344320abc"
    }
)
let validateServiceNumberFormat_lessthan10 = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "034432002"
    }
)
let validateServiceNumberFormat_greaterthan10 = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "03443200277"
    },
    //custom variable
    // {}
)
let validateServiceNumberFormat = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "0344320027"
    }
)

async function Run() {
    await customComponent.invoke("validateServiceNumberFormat", validateServiceNumberFormat_alpanumeric, component);
    await customComponent.invoke("validateServiceNumberFormat", validateServiceNumberFormat_lessthan10, component);
    await customComponent.invoke("validateServiceNumberFormat", validateServiceNumberFormat_greaterthan10, component);
    await customComponent.invoke("validateServiceNumberFormat", validateServiceNumberFormat, component);
};

Run();