const baseConfig = require('../base_config');

module.exports = {
    API: {
        Name: "Reconnection",
        PostOptions: (body) => {
            return {
                'method': 'POST',
                'url': `${baseConfig.BaseUrl}amdocs/api/account/reconnect`,
                'headers': {
                    'Content-Type': 'application/json',
                    'X-Pldt-Auth-Token': baseConfig.AuthToken,
                    'Cookie': baseConfig.Cookie
                },
                body: body
            }
        },
        InsertDataOptions: (body) => {
            return {
                'method': 'POST',
                'url': `${baseConfig.ChatBotBaseUrl}:7744/insertReconnectionSuccessResponse`,
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: body
            }
        }
    }
}