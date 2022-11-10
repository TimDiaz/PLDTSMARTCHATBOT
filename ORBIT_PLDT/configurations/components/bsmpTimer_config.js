const baseConfig = require('../base_config');

module.exports = {
    Type: {
        FIBR: "BSMPTimerFIBR",
        DSL: "BSMPTimerDSL"
    },
    API: {
        Name: "BSMPChecker",
        PostOptions: (telNumber) => {
            return {
                'method': 'POST',
                'url': 'http://125.5.180.222:8080/expresse/services/pe_data',
                body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.api.report.dslo.assia.com" xmlns:xsd="http://model.napi.dslo.assia.com/xsd">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <ws:getData>\r\n         <!--Optional:-->\r\n         <ws:reportID>PON_LINE_SUMMARY_DATA</ws:reportID>\r\n         <!--Optional:-->\r\n         <ws:key>\r\n            <!--Optional:-->\r\n            <xsd:type>LINE_ID</xsd:type>\r\n            <!--Optional:-->\r\n            <xsd:value>' + telNumber + '</xsd:value>\r\n         </ws:key>\r\n      </ws:getData>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>',
                timeout: 120000 //120000 ms is 2 min
            }
        },
        InsertData: {
            URL: `${baseConfig.ChatBotBaseUrl}:7744/insertSMPTimerData`,
            PostOption: (data) => {
                return {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }
            },
        }
    },
}