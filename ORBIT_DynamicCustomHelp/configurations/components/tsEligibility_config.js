const apiBaseConfig = require('../apiBase_config');

module.exports = {
    API: {
        Name: "AccountEligibility",
        GetOptions: (serviceNumber) => {
            return {
                'method': 'GET',
                'url': `${apiBaseConfig.BaseUrl}amdocs/api/account/eligibility/${serviceNumber}`,
                'headers': {
                    'Content-Type': 'application/json',
                    'X-Pldt-Auth-Token': apiBaseConfig.AuthToken,
                    'Cookie': apiBaseConfig.Cookie,
                    'Accept': 'application/json',
                }
            }
        }
    }
}