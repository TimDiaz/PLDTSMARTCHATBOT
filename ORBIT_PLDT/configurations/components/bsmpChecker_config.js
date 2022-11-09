const baseConfig = require('../base_config');

module.exports = {
    API: {
        Name: "FetchSMPData",
        GetOptions: (telNumber, smpStartTs) => {
            return {
                'method': 'GET',
                'url': `${baseConfig.ChatBotBaseUrl}:7744/fetchSMPData/${telNumber}/${smpStartTs}`,
                'headers': {
                    'Content-Type': 'text/plain'
                }
            }
        },
        UpdateRedirectTypeUrl: `${baseConfig.ChatBotBaseUrl}:7744/updateRedirectData`,
        UpdateReturnSpielUrl: `${baseConfig.ChatBotBaseUrl}:7744/spielreturned54321`
    },
}