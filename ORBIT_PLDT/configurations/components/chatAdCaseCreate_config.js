const baseConfig = require('../base_config');

module.exports = {
    API:{
        ChatAdToken: {
            Name: "ChatAdCaseCreateToken", 
            PostOptions: (form) => {
                return {
                    'method': 'POST',
                    'url': `${baseConfig.CaseCreation.ChatAdCaseCreate.TokenBase.Url}services/oauth2/token`,
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': baseConfig.CaseCreation.ChatAdCaseCreate.TokenBase.Cookie
                    },
                    form: {
                        'grant_type': baseConfig.CaseCreation.ChatAdCaseCreate.TokenBase.Auth.GrantType,
                        'client_id': baseConfig.CaseCreation.ChatAdCaseCreate.TokenBase.Auth.ClientID,
                        'client_secret': baseConfig.CaseCreation.ChatAdCaseCreate.TokenBase.Auth.ClientSecret,
                        'username': baseConfig.CaseCreation.ChatAdCaseCreate.TokenBase.Auth.Username,
                        'password': baseConfig.CaseCreation.ChatAdCaseCreate.TokenBase.Auth.Password
                    }
                }
            },
        },
        ChatAdCaseCreate: {
            Name: "ChatAdCaseCreateBody",
            PostOptions: (authBearer, body) => {
                return {
                    'method': 'POST',
                    'url': `${baseConfig.CaseCreation.ChatAdCaseCreate.Base.Url}services/data/v49.0/sobjects/Case`,
                    'headers': {
                        'Authorization': authBearer,
                        'Content-Type': 'application/json',
                        'Cookie': baseConfig.CaseCreation.ChatAdCaseCreate.Base.Cookie
                    },
                    body: body
                }
            },

        }
    },
}