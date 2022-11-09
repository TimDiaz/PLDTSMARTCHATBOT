"use strict";

const component = require('../../components/caseCreation/checkWaitTime');
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
        "deploymentid": "5722u000000XZAR",
        "buttonid": "5732u0000008OIU"
    }
)

async function Run() {
    // await customComponent.invoke("CheckWaitTime", param_notexist, component);
    await customComponent.invoke("CheckWaitTime", param_exist, component);
};

Run();