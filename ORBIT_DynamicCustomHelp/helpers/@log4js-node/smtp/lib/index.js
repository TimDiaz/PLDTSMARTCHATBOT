'use strict';

const mailer = require('nodemailer');
const os = require('os');
const request = require('request');
const globalProp = require('../../../globalProperties');

function insertBcpLogging(apiName, apiErrorCode, apiErrorMsg, aaccNumber, telNumber, emailResp){
  var options = {
      'method': 'POST',
      'url': globalProp.Logger.BCPLogging.URL,
      'headers': {
          'Content-Type': 'application/json'
          },
      body: JSON.stringify({
              "apiname": apiName,
              "apierrorcode":  apiErrorCode,
              "apierrormsg": apiErrorMsg,
              "usertel": telNumber,
              "useracntnum": aaccNumber,
              "emailresp": emailResp
          })

      };

  request(options, function (error, response) {
      if (error) {
          console.log("error on bcp api: " + error);
      }else{
          console.log("successful on bcp api: " + response.body);
      }   
  });
}

function getTransportOptions(config) {
  let options = {};
  if (config.SMTP) {
    options = config.SMTP;
  } else if (config.transport) {
    options = config.transport.options || {};
    options.transport = config.transport.plugin || 'smtp';
  }
  return options;
}

/**
 * SMTP Appender. Sends logging events using SMTP protocol.
 * It can either send an email on each event or group several
 * logging events gathered during specified interval.
 *
 * @param _config appender configuration data
 *    config.sendInterval time between log emails (in seconds), if 0
 *    then every event sends an email
 *    config.shutdownTimeout time to give up remaining emails (in seconds; defaults to 5).
 * @param _layout a function that takes a logevent and returns a string (defaults to basicLayout).
 */
function smtpAppender(config, layout, subjectLayout) {
  if (!config.attachment) {
    config.attachment = {};
  }

  config.attachment.enable = !!config.attachment.enable;
  config.attachment.message = config.attachment.message || 'See logs as attachment';
  config.attachment.filename = config.attachment.filename || 'default.log';

  const sendInterval = config.sendInterval * 1000 || 0;
  const shutdownTimeout = ('shutdownTimeout' in config ? config.shutdownTimeout : 5) * 1000;
  const transport = mailer.createTransport(getTransportOptions(config));
  transport.on('error', (error) => {
    console.error('log4js.smtpAppender - Error happened', error); // eslint-disable-line no-console
  });
  const logEventBuffer = [];

  let unsentCount = 0;
  let sendTimer;

  function sendBuffer() {
    if (logEventBuffer.length > 0) {
      const firstEvent = logEventBuffer[0].data[0].message;
      const obj = logEventBuffer[0].data[0];
      let body = '';
      const count = logEventBuffer.length;
      while (logEventBuffer.length > 0) {
        const data = logEventBuffer.shift();
        data.data[0] = data.data[0].message;
        body += `${layout(data, config.timezoneOffset)}\n`;
      }

      const msg = {
        to: config.recipients,
        subject: config.subject || subjectLayout(firstEvent),
        headers: { Hostname: os.hostname() },
        cc: config.cc,
        bcc: config.bcc,
      };

      if (config.attachment.enable === true) {
        msg[config.html ? 'html' : 'text'] = config.attachment.message;
        msg.attachments = [
          {
            filename: config.attachment.filename,
            contentType: 'text/x-log',
            content: body
          }
        ];
      } else {
        msg[config.html ? 'html' : 'text'] = body;
      }

      if (config.sender) {
        msg.from = config.sender;
      }
      transport.sendMail(msg).then((t) => { 
        //console.error('log4js.smtpAppender - Sent mail', t);
        insertBcpLogging(obj.apiname, obj.apierrorcode, obj.apierrormsg, obj.useracntnum, obj.usertel, t); //save to db on then
        transport.close();
        unsentCount -= count;
      }).catch((e) => {
        //console.error('log4js.smtpAppender - Send mail error happened', e);
        insertBcpLogging(obj.apiname, obj.apierrorcode, obj.apierrormsg, obj.useracntnum, obj.usertel, e); //save to db one catch
        transport.close();
        unsentCount -= count;
      });
      // transport.sendMail(msg, (error) => {
      //   if (error) {
      //     console.error('log4js.smtpAppender - Send mail error happened', error); // eslint-disable-line no-console
      //   }
      //   transport.close();
      //   unsentCount -= count;
      // });
    }
  }

  function scheduleSend() {
    if (!sendTimer) {
      sendTimer = setTimeout(() => {
        sendTimer = null;
        sendBuffer();
      }, sendInterval);
    }
  }

  function shutdown(cb) {
    if (sendTimer) {
      clearTimeout(sendTimer);
    }

    sendBuffer();

    let timeout = shutdownTimeout;
    (function checkDone() {
      if (unsentCount > 0 && timeout >= 0) {
        timeout -= 100;
        setTimeout(checkDone, 100);
      } else {
        cb();
      }
    }());
  }

  const appender = (loggingEvent) => {
    unsentCount += 1;
    logEventBuffer.push(loggingEvent);
    if (sendInterval > 0) {
      scheduleSend();
    } else {
      sendBuffer();
    }
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
  return smtpAppender(config, layout, subjectLayout);
}

module.exports.configure = configure;
