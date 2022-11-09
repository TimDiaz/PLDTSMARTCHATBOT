"use strict";

const component = require('../../components/caseCreation/paymentDate');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let param_notexist = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "0333205890"
    }
)
let param_exist = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "0333205890",
        "requestDate": "09/12/2022"
    }
)

async function Run() {
    // await customComponent.invoke("CheckWaitTime", param_notexist, component);
    await customComponent.invoke("PaymentDate", param_exist, component);
};

Run();