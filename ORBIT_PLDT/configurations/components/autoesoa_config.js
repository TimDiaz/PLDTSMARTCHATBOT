const baseConfig = require('../base_config');

module.exports = {
    API:{
        GetEsoaBalance: {
            Name: "GetEsoaBalanceBody", 
            GetOptions: (svcNum, numMon) => {
                return {
                    'method': 'GET',
                    'url': `${baseConfig.SwitchURL}amdocs/api/sendeSOA/${svcNum}/${numMon}`,
                    'headers': {
                        'X-Pldt-Auth-Token': baseConfig.SwitchToken,
                        'Cookie': baseConfig.SwitchCookies
                    }
                }
            },
        }
  }
}