const apiBaseConfig = require('../apiBase_config');

module.exports = {
    API:{
        Serviceable: {
            Name: "NumberServiceability", 
            PostOptions: (body) => {
                return {
                    'method': 'POST',
                    'url': `${apiBaseConfig.BaseUrl}pldthome/api/serviceability/number/serviceable`,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Cookie': apiBaseConfig.Cookie
                    },                
                    body: body
                }
            },
            Token: "YjQ5NzQyNWItNmE4NC00YzZlLThlM2UtYmU4OGNjZjc2YmQy",
            Consumer: "CHATBOT",
        }
    },        
}