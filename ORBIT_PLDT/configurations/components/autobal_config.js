const baseConfig = require('../base_config');

module.exports = {
    API: {
        // GetAccountBalance: {
        //     Name: "GetAccountBalanceBody",
        //     GetOptions: (acctNum) => {
        //         return {
        //             'method': 'GET',
        //             'url': `${baseConfig.Kenan.BaseUrl}pldthome/api/smartbridge/PLDTKenan/PLDTKenanService.svc/rest/GetAccountBalance/${acctNum}/0`,
        //             'headers': {
        //                 'X-Pldt-Auth-Token': baseConfig.Kenan.AuthToken,
        //                 'X-Pldt-Client-Id': baseConfig.Kenan.ClientID,
        //                 'Cookie': baseConfig.Kenan.Cookie
        //             }
        //         }
        //     },
        // },
        CheckBalance: {
            Name: "CheckBalanceBody",
            GetOptions: (svcNum) => {
                return {
                    'method': 'GET',
                    'url': `${baseConfig.SwitchURL}amdocs/api/autocheckbalance/${svcNum}`,
                    'headers': {
                        'X-Pldt-Auth-Token': baseConfig.SwitchToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Cookie': baseConfig.SwitchCookies
                    }
                }
            },
        }
    }
}