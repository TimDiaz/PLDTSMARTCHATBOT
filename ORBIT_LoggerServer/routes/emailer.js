const request = require("request");
const ons = require("oci-ons");
const common = require("oci-common");
const initLogger = require('log4js');

var appRouter = function (app) {
    function insertBcpLogging(apUrl, apiName, apiErrorCode, apiErrorMsg, accNumber, telNumber, emailResp) {
        const logger = initLogger.getLogger("BCPInsert");
        logger.addContext("serviceNumber", 'bcp_insert')
        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        logger.info(`- [START BCP LOGGING] Account Number: ${accNumber} - Telephone Number: ${telNumber}                         -`)
        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        
        var postBody = JSON.stringify({
            "apiname": apiName,
            "apierrorcode": apiErrorCode,
            "apierrormsg": apiErrorMsg,
            "usertel": telNumber,
            "useracntnum": accNumber,
            "emailresp": emailResp
        });

        var options = {
            'method': 'POST',
            'url': apUrl,
            'headers': {
                'Content-Type': 'application/json'
            },
            body: postBody

        };
        logger.info(`[Setting up the options]: ${postBody}`);
        request(options, function (error, response) {
            if (error) {
                logger.error(`[ERROR]: ${error}`);
                console.log("error on bcp api: " + error);
            } else {
                logger.info(`[SUCCESSFUL]: ${response.body}`);
                console.log("successful on bcp api: " + response.body);
            }

            logger.info(`-------------------------------------------------------------------------------------------------------------`)
            logger.info(`- [END BCP LOGGING] Account Number: ${accNumber} - Telephone Number: ${telNumber}                           -`)
            logger.info(`-------------------------------------------------------------------------------------------------------------`)
        });
    }

    app.post('/sendEmail', async (request, response) => {
        const logger = initLogger.getLogger("EMailSending");
        logger.addContext("serviceNumber", 'email_sending')

        const subject = request.body.subject;
        const message = request.body.message;
        const apiurl = request.body.apiurl;
        const apiname = request.body.apiname;
        const apierrorcode = request.body.apierrorcode;
        const apierrormsg = request.body.apierrormsg;
        const usertelephonenumber = request.body.usertelephonenumber;
        const useraccountnumber = request.body.useraccountnumber;
        const topicId = "ocid1.onstopic.oc1.iad.aaaaaaaabnyitfgfqol3dl7ny2qhh6bqgvrkvuaijuw6yavd4xdgyzmikibq";

        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        logger.info(`- [START EMAIL]                                                                                             -`)
        logger.info(`-------------------------------------------------------------------------------------------------------------`)

        try {
            logger.info(`[Setting up email configuration]`);
            const provider = new common.ConfigFileAuthenticationDetailsProvider();
            const client = new ons.NotificationDataPlaneClient({
                authenticationDetailsProvider: provider
            });

            const messageDetails = {
                title: subject,
                body: message
            };
            
            logger.info(`[Setting up email message details]`);
            logger.info(`[EMail Subject]: ${messageDetails.title}`);
            logger.info(`[EMail Body]: ${messageDetails.body}`);
            logger.info(`[EMail TopicId]: ${topicId}`);

            const publishMessageRequest = {
                topicId: topicId,
                messageDetails: messageDetails,
                messageType: ons.requests.PublishMessageRequest.MessageType.RawText
            };      
            logger.info(`[Sending EMail]......................`);      
            const publishMessageResponse = await client.publishMessage(publishMessageRequest);
            logger.info(`[Successfully sent]..................`);    
            console.log(publishMessageResponse);

            insertBcpLogging(apiurl, apiname, apierrorcode, apierrormsg, useraccountnumber, usertelephonenumber, publishMessageResponse);
            response.status(200).send(publishMessageResponse);

        } catch (ex) {
            logger.info(`[ERROR]: ${ex}`);
            insertBcpLogging(apiurl, apiname, apierrorcode, apierrormsg, useraccountnumber, usertelephonenumber, ex);
            response.status(200).send(ex);
        }        

        logger.info(`-------------------------------------------------------------------------------------------------------------`)
        logger.info(`- [END EMAIL]                                                                                               -`)
        logger.info(`-------------------------------------------------------------------------------------------------------------`)
    });
}

module.exports = appRouter;
