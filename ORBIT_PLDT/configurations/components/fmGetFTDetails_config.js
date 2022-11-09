const baseConfig = require('../base_config');

module.exports = {
    API:{  
        Name: "FMGetFTDetail",   
        PostOptions: (body) => {
            return {
                'method': 'POST',
                'url': `${baseConfig.BaseUrl}amdocs/api/clarity/fmGetFtDetails`,
                'headers': {
                    'Content-Type': 'application/json',
                    'X-Pldt-Auth-Token': baseConfig.AuthToken,
                    'Cookie': baseConfig.Cookie
                },                
                body: body
            }
        }          
    },
    ConnectionType: {
        POTSADSL: 'POTS POSTPAID|ADSL',
        ADSLPOTS: 'ADSL|POTS POSTPAID',
        ADSL: 'ADSL',
        POTS: 'POTS POSTPAID'
    }
}