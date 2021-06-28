const config = require("../../privateData/config.json");

exports.name = "membercount";

exports.description = "Aktualisiert den Mitgliedercounter";

exports.usage = `${config.prefix}membercount`;



exports.run = (client, message) => {
    if (!(Object.values(config.ids.acceptedAdmins).includes(message.author.id))) return message.reply('You do not have the permissions to perform that command.');

    const guild = client.guilds.cache.get(config.ids.serverID);
    const memberCount = guild.memberCount;
    const channel = guild.channels.cache.get(config.ids.channelIDs.dev.memberCounter);
    message.channel.send(`Mitgliederanzahl auf: ${memberCount.toLocaleString()} gesetzt`)
    channel.setName(`👥 Mitglieder:${memberCount.toLocaleString()}`);
    console.log(`Manually set membercount to ${memberCount.toLocaleString()}`)

}