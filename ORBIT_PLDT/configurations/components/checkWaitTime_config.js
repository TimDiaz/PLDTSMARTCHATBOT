const baseConfig = require('../base_config');

module.exports = {
    API:{
        WaitTime: {
            Name: "CheckWaitTime", 
            PostOptions: (orgId, deploymentId, buttonId) => {
                return {
                    'method': 'GET',
                    'url': `${baseConfig.CaseCreation.CheckWaitTime.Base.Url}chat/rest/Visitor/Availability?org_id=${orgId}&deployment_id=${deploymentId}&Availability.ids=${buttonId}&Availability.needEstimatedWaitTime=1`,
                    'headers': {
                        'X-LIVEAGENT-API-VERSION': '34',
                        'Cookie': baseConfig.CaseCreation.CheckWaitTime.Base.Cookie
                    }
                }
            },
        }
    },
}