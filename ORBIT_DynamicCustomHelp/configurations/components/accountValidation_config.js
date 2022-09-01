const apiBaseConfig = require('../apiBase_config');

module.exports = {
    API:{
        Validate: {     
            Name: "AccountValidation",   
            PostOptions: (body) => {
                return {
                    'method': 'POST',
                    'url': `${apiBaseConfig.BaseUrl}amdocs/api/account/validate`,
                    'headers': {
                        'Content-Type': 'application/json',
                        'X-Pldt-Auth-Token': apiBaseConfig.AuthToken,
                        'Cookie': apiBaseConfig.Cookie
                    },                
                    body: body
                }
            }            
        }
    }
}