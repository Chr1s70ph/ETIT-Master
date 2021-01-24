const Discord = require('discord.js');

exports.run = (client, message, args) => {
    if (args == "mathe") {
        message.channel.send("Mathe!");
    }
}