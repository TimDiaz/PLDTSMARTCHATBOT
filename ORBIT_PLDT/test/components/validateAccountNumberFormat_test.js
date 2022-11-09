"use strict";

const component = require('../../components/accountValidation/validateFormats/validateAccountNumberFormat');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let validateAccountNumberFormat_alpanumeric = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0023087abc",
        "serviceNumber": "0344320027"
    },
)
let validateAccountNumberFormat_lessthan10 = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "002308727",
        "serviceNumber": "0344320027"
    },
)
let validateAccountNumberFormat_greaterthan10 = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "00230872789",
        "serviceNumber": "0344320027"
    },
)
let validateAccountNumberFormat = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "accountNumber": "0023087278",
        "serviceNumber": "0344320027"
    },
)

async function Run() {
    await customComponent.invoke("validateAccountNumberFormat", validateAccountNumberFormat_alpanumeric, component);
    await customComponent.invoke("validateAccountNumberFormat", validateAccountNumberFormat_lessthan10, component);
    await customComponent.invoke("validateAccountNumberFormat", validateAccountNumberFormat_greaterthan10, component);
    await customComponent.invoke("validateAccountNumberFormat", validateAccountNumberFormat, component);
};

Run();