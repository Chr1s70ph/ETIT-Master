const config = require("../../privateData/config.json");
const {
    MessageButton,
    MessageActionRow
} = require('discord-buttons');
const discord = require('discord.js');


exports.name = "devtest";

exports.description = "Testfunktion von neuen Features";

exports.usage = `${config.prefix}devtest`;


exports.run = async (client, message) => {
    message.channel.send(client.guilds.cache.get(config.ids.serverID).members.cache
        .filter(m => m.presence.status === 'online').size);
}