const config = require("../../privateData/config.json");


exports.run = (client, message) => {
    if (message.author == config.ids.userID.ownerID) {
        const guild = client.guilds.cache.get(config.ids.serverID);
        const memberCount = guild.memberCount;
        const channel = guild.channels.cache.get(config.ids.channelIDs.dev.memberCounter);
        message.channel.send(`Mitgliederanzahl auf: ${memberCount.toLocaleString()} gesetzt`)
        channel.setName(`👥 Mitglieder:${memberCount.toLocaleString()}`);
        console.log(`Manually set membercount to ${memberCount.toLocaleString()}`)
    } else {
        message.reply('You do not have the permissions to perform that command.');
    }
}