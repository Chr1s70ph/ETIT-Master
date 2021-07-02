const discord = require('discord.js');
const config = require("../../privateData/config.json");

exports.name = "command";

exports.description = "Dieser Befehl zeigt eine Befehlshilfe an.";

exports.usage = `${config.prefix}command {COMMAND}`;

exports.example = `${config.prefix}command test`;

exports.aliases = ['commandinfo'];


exports.run = (client, message, args) => {
    let commandHelpEmbed = new discord.MessageEmbed()
        .setColor('#7289da')
        .setAuthor("Befehlshilfe", 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Lol_question_mark.png')
        .setThumbnail(client.guilds.resolve(config.ids.serverID).members.resolve(config.ids.userID.botUserID).user.avatarURL())



    for (let [key, value] of client.commands.entries()) {

        if (args[0] == undefined) {
            return message.channel.send("Please provide arguments!")
        }

        if (key == args[0].toLowerCase()) {
            commandHelpEmbed.setTitle(`‎${value.name}\n ‎`)
            commandHelpEmbed.addFields({
                name: 'Beschreibung',
                value: `${value.description}\n‎ ‎`,
                inline: false
            }, {
                name: 'Benutzung:',
                value: `${value.usage}\n ‎`,
                inline: false
            });
            return message.channel.send(commandHelpEmbed);
        }
    }

    return message.channel.send("Bitte verwende einen Commandnamen.")

}