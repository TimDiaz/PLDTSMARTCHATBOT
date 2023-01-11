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
                body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"  xmlns:ws="http://ws.api.report.dslo.assia.com"  xmlns:xsd="http://model.napi.dslo.assia.com/xsd">\r\n <soapenv:Body>\r\n  <ws:getData>\r\n <ws:reportID>PON_LINE_SUMMARY_DATA</ws:reportID>\r\n  \r\n <ws:key>\r\n <xsd:type>LINE_ID</xsd:type>\r\n <xsd:value>${telNumber}</xsd:value>\r\n  </ws:key>\r\n  \r\n <ws:parameters>\r\n <xsd:type>REQUEST_TYPE</xsd:type>\r\n <xsd:value>ON_THE_FLY</xsd:value>\r\n </ws:parameters> \r\n  \r\n  \r\n  </ws:getData>\r\n </soapenv:Body>`,
                timeout: 120000 //120000 ms is 2 min
            }
        },
        UpdatePostOptions: (telNumber) => {
            return {
                'method': 'POST',
                'url': 'http://125.5.180.222:8080/expresse/services/realtime.realtimeHttpSoap12Endpoint/',
                body: `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:impl="http://impl.realtime.dslo.assia.com"  xmlns:xsd="http://api.realtime.dslo.assia.com/xsd"  xmlns:xsd1="http://model.napi.dslo.assia.com/xsd">\r\n <soap:Header/>\r\n<soap:Body>\r\n<impl:submitRequest>\r\n   <!--Optional:-->\r\n <impl:request>\r\n <xsd:additionalParameters>\r\n <xsd1:type>REQUEST_TYPE</xsd1:type>\r\n <xsd1:value>REAL_TIME_DIAGNOSTICS_WITHOUT_LOCALIZATION</xsd1:value>\r\n </xsd:additionalParameters>\r\n <xsd:entityID>${telNumber}</xsd:entityID>\r\n <xsd:requestType>PON_LINE_SUMMARY_DATA</xsd:requestType>\r\n </impl:request>\r\n <impl:timeout>230</impl:timeout>\r\n </impl:submitRequest>\r\n </soap:Body>\r\n </soap:Envelope>`,
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