"use strict";

const component = require('../../components/eswup/eswupGetDownTime');
const testing = require('@oracle/bots-node-sdk/testing');
const customComponent = require('../helpers/invokeCustomComponent');

let landline_and_internet_confirmed = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "447943968"
    }
)
let landline_trending = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "464184308"
    }
)
let internet_confirmed = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "285185301"
    }
)
let landline_and_internet_treding = testing.MockRequest(
    //message payload
    {},
    //properties
    {
        "serviceNumber": "282607327"
    }
)

async function Run() {
    await customComponent.invoke("ESWUP_GetDownTime", landline_and_internet_treding, component);
};

Run();