const baseConfig = require('../base_config');

module.exports = {
    API:{  
        Name: "FMGetFTDetail",   
        PostOptions: (body) => {
            return {
                'method': 'POST',
                'url': `${baseConfig.SwitchURL}amdocs/api/clarity/fmGetFtDetails`,
                'headers': {
                    'Content-Type': 'application/json',
                    'X-Pldt-Auth-Token': baseConfig.SwitchToken,
                    'Cookie': baseConfig.SwitchCookies
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