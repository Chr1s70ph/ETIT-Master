var private = require('../private.js');
const serverId = private.serverId;

exports.Ping = Ping;

async function Ping(client) {

    await client.api.applications(client.user.id).guilds(serverId).commands.post({
        data: {
            name: "ping",
            description: "Prüft, ob der Bot ordnungsgemäß antwortet"
        }
    });   
    
    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        
        if (command === 'ping'){
            await client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        //content: `🏓Latency is ${Date.now() - interaction.Date}ms. API Latency is ${Math.round(client.ws.ping)}ms`,                        
                        content: "pong",
                        flags: 64
                    }
                }
            });
        }
    });
}