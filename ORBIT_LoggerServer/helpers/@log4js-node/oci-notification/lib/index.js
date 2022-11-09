'use strict';

const ons = require("oci-ons");
const common = require("oci-common");
const os = require('os');
const request = require('request');

function insertBcpLogging(apUrl, apiName, apiErrorCode, apiErrorMsg, aaccNumber, telNumber, emailResp) {
    var options = {
        'method': 'POST',
        'url': apUrl,
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "apiname": apiName,
            "apierrorcode": apiErrorCode,
            "apierrormsg": apiErrorMsg,
            "usertel": telNumber,
            "useracntnum": aaccNumber,
            "emailresp": emailResp
        })

    };

    request(options, function (error, response) {
        if (error) {
            console.log("error on bcp api: " + error);
        } else {
            console.log("successful on bcp api: " + response.body);
        }
    });
}

function ociNotificationAppender(config, layout, subjectLayout) {
    const provider = new common.ConfigFileAuthenticationDetailsProvider();//authentication/config - for local test
    const client = new ons.NotificationDataPlaneClient({
        authenticationDetailsProvider: provider
    });

    function shutdown(cb) {
        cb();
    }

    const appender = (loggingEvent) => {
        (async () => {
            const apiurl = loggingEvent.context.apiurl || "";
            const apiname = loggingEvent.context.apiname || "";
            const apierrorcode = loggingEvent.context.apierrorcode || "";
            const apierrormsg = loggingEvent.context.apierrormsg || "";
            const usertelephonenumber = loggingEvent.context.usertelephonenumber || "";
            const useraccountnumber = loggingEvent.context.useraccountnumber || "";

            try {
                // build message
                const messageDetails = {
                    title: (config.subject || loggingEvent.context.subject) || subjectLayout(firstEvent),
                    body: `${layout(loggingEvent, config.timezoneOffset)}\n`
                };

                const publishMessageRequest = {
                    topicId: loggingEvent.context.topicId,
                    messageDetails: messageDetails,
                    messageType: ons.requests.PublishMessageRequest.MessageType.RawText
                };

                // send message
                const publishMessageResponse = await client.publishMessage(publishMessageRequest);

                console.log(publishMessageResponse);
                insertBcpLogging(apiurl, apiname, apierrorcode, apierrormsg, useraccountnumber, usertelephonenumber, publishMessageResponse);

            } catch (ex) {
                console.error(`Failed due to ${ex}`);
                insertBcpLogging(apiurl, apiname, apierrorcode, apierrormsg, useraccountnumber, usertelephonenumber, ex);
            }
        })();
    };

    appender.shutdown = shutdown;

    return appender;
}

function configure(config, layouts) {
    const subjectLayout = layouts.messagePassThroughLayout;
    let layout = layouts.basicLayout;
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    return ociNotificationAppender(config, layout, subjectLayout);
}

module.exports.configure = configure;
