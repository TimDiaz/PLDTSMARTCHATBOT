
"use strict";

const request = require('request');
const globalProp = require('../helpers/globalProperties');

function SendEmail(subject, message, apiname, error, code, accountNumber, serviceNumber) {
    const errorreplaced = JSON.stringify(error).replace('http://', '');

    const apiurl = globalProp.Logger.BCPLogging.URL;
    const emailurl = globalProp.Email.URL;

    var options = {
        'method': 'POST',
        'url': emailurl,
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "subject": subject,
            "message": message,
            "apiurl": apiurl,
            "apiname": apiname,
            "apierrorcode": code,
            "apierrormsg": errorreplaced,
            "usertelephonenumber": serviceNumber,
            "useraccountnumber": accountNumber
        })

    };

    request(options, function (error, response) {
        if (error) {
            console.log("[EMAIL ERROR]: " + error);
        } else {
            console.log("[EMAIL RESPONSE]: " + response.body);
        }
    });
}

module.exports = SendEmail;