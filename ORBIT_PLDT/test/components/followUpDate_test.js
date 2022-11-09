"use strict";

const component = require('../../components/caseCreation/followUpDate');
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
        "requestDate": "09/13/2022"
    }
)

async function Run() {
    // await customComponent.invoke("CheckWaitTime", param_notexist, component);
    await customComponent.invoke("FollowUpDate", param_exist, component);
};

Run();