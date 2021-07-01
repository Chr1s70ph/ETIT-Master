const schedule = require('node-schedule');
const config = require('../privateData/config.json');
const online_refresh_timer = "*/15 * * * *"

exports.run = async (client) => {
    const guild = client.guilds.cache.get(config.ids.serverID);
    const onlineCounterChannel = guild.channels.cache.get(config.ids.channelIDs.dev.onlineCounter);


    schedule.scheduleJob(online_refresh_timer, function () {
        
        let onlineCount = fetchNumberOfOnlineMembers(client);
        onlineCounterChannel.setName(`🟢Online:${onlineCount.toLocaleString()}`);
        console.log(`Updated online Member count to ${onlineCount.toLocaleString()}`)
    });
}

function fetchNumberOfOnlineMembers(client) {
    return client.guilds.cache.get(config.ids.serverID).members.cache
        .filter(m =>
            m.presence.status === 'online' || m.presence.status === 'idle' || m.presence.status === 'dnd'
        ).size;
}