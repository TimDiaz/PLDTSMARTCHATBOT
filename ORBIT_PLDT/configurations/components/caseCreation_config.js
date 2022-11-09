const baseConfig = require('../base_config');

module.exports = {
    API:{
        Token: {
            Name: "CaseCreationToken", 
            PostOptions: () => {
                return {
                    'method': 'POST',
                    'url': `${baseConfig.CaseCreation.CaseCreation.TokenBase.Url}services/oauth2/token`, 
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': baseConfig.CaseCreation.CaseCreation.TokenBase.Cookie
                    },
                    form: {
                        'grant_type': baseConfig.CaseCreation.CaseCreation.TokenBase.Auth.GrantType,
                        'client_id': baseConfig.CaseCreation.CaseCreation.TokenBase.Auth.ClientID,
                        'client_secret': baseConfig.CaseCreation.CaseCreation.TokenBase.Auth.ClientSecret,
                        'username': baseConfig.CaseCreation.CaseCreation.TokenBase.Auth.Username,
                        'password': baseConfig.CaseCreation.CaseCreation.TokenBase.Auth.Password
                    }
                }
            },
        },
        CaseCreate: {
            Name: "CaseCreationBody",
            PostOptions: (authBearer, body) => {
                return {
                    'method': 'POST',
                    'url': `${baseConfig.CaseCreation.CaseCreation.Base.Url}/services/data/v53.0/sobjects/Case`,
                    'headers': {
                        'Authorization': authBearer,
                        'Content-Type': 'application/json',
                        'Cookie': baseConfig.CaseCreation.CaseCreation.Base.Cookie
                    },
                    body: body
                }
            },

        }
    },
}