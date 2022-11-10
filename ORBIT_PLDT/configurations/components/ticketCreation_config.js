const baseConfig = require('../base_config');

module.exports = {
    API:{
        Validate: {     
            Name: "TicketCreation",   
            PostOptions: (body) => {
                return {
                    'method': 'POST',
                    'url': `${baseConfig.BaseUrl}askpldt-api/customers/tickets`,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Cookie': baseConfig.Cookie
                    },                
                    body: body,
                    timeout: 120000 //120000 ms is 2 min
                }
            }            
        },
        UpdateCreateFt: {
            URL: `${baseConfig.ChatBotBaseUrl}:7744/updateCreaeteFT`,
            PostOptions: (body) => {
                return {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }
            }
        }
    }
}