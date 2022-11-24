const baseConfig = require('../base_config');

module.exports = {
    API: {
        Token: {
            Name: "ESWUP_Token",
            PostOptions: () => {
                return {
                    'method': 'POST',
                    'url': `${baseConfig.ESWUP.BaseUrl}token`,
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    form: {
                        'username': baseConfig.ESWUP.TokenPayload.Username,
                        'password': baseConfig.ESWUP.TokenPayload.Password,
                        'grant_type': baseConfig.ESWUP.TokenPayload.Grant_Type
                    }
                }
            },
        },
        GetDownTime: {
            Name: "ESWUP_GetDownTime",
            GetOptions: (telephoneNumber, token) => {
                return {
                    'method': 'GET',
                    'url': `${baseConfig.ESWUP.BaseUrl}api/IVRSF/GetDownTime?Mins=${telephoneNumber}`,
                    'headers': {
                        'Authorization': `Bearer ${token}`
                    }
                }
            },
        }
    }
}