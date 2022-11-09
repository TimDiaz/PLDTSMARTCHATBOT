const baseConfig = require('../base_config');

module.exports = {
    API:{
        Token: {
            Name: "FollowUpCaseToken", 
            PostOptions: () => {
                return {
                    'method': 'POST',
                    'url': `${baseConfig.CaseCreation.FollowUpCase.TokenBase.Url}services/oauth2/token`,
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': baseConfig.CaseCreation.FollowUpCase.TokenBase.Cookie
                    },
                    form: {
                        'grant_type': baseConfig.CaseCreation.FollowUpCase.TokenBase.Auth.GrantType,
                        'client_id': baseConfig.CaseCreation.FollowUpCase.TokenBase.Auth.ClientID,
                        'client_secret': baseConfig.CaseCreation.FollowUpCase.TokenBase.Auth.ClientSecret,
                        'username': baseConfig.CaseCreation.FollowUpCase.TokenBase.Auth.Username,
                        'password': baseConfig.CaseCreation.FollowUpCase.TokenBase.Auth.Password
                    }
                }
            },
        },
        CaseCreate: {
            Name: "FollowUpCaseBody",
            PostOptions: (authBearer, body) => {
                return {
                    'method': 'POST',
                    'url': `${baseConfig.CaseCreation.FollowUpCase.Base.Url}services/data/v53.0/sobjects/Case`,
                    'headers': {
                        'Authorization': authBearer,
                        'Content-Type': 'application/json',
                        'Cookie': baseConfig.CaseCreation.FollowUpCase.Base.Cookie
                    },
                    body: body
                }
            },

        }
    },
}