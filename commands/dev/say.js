const config = require("../../privateData/config.json");


exports.run = (client, message) => {
    if (message.author != config.ids.userID.ownerID) return message.reply('You do not have the permissions to perform that command.');

    var content = message.content;

    var command = content.substring(content.indexOf(" ") + 1);
    message.channel.send(command);
}