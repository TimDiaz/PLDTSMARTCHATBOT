const baseConfig = require('../base_config');

module.exports = {
    API: {
        Name: "BSMPChecker",
        GetOptions: (telNumber, smpStartTs) => {
            return {
                'method': 'GET',
                'url': `${baseConfig.ChatBotBaseUrl}:7744/fetchSMPData/${telNumber}/${smpStartTs}`,
                'headers': {
                    'Content-Type': 'text/plain'
                },
                timeout: 120000 //120000 ms is 2 min
            }
        },
        UpdateRedirectTypeAndSpielReturn: `${baseConfig.ChatBotBaseUrl}:7744/updateRedirectAndSpielReturn`
    },
}