const baseConfig = require('../base_config');

module.exports = {
    API:{   
        Name: "Serviceability",   
        PostOptions: (body) => {
            return {
                'method': 'POST',
                'url': `${baseConfig.BaseUrl}pldthome/api/serviceability/facilities/checker`,
                'headers': {
                    'Content-Type': 'application/json',
                    'Cookie': baseConfig.Cookie
                },                
                body: body
            }
        },
        Token: baseConfig.NumberServiceability.Token,
        Consumer: baseConfig.NumberServiceability.Consumer,            
    }
}