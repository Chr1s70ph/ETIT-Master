const config = require("../../privateData/config.json");


exports.run = (client, message) => {
    if (message.author == config.ids.userID.ownerID) {
        var content = message.content;

        var command = content.substring(content.indexOf(" ") + 1);
        message.channel.send(command);
    } else {
        message.reply('You do not have the permissions to perform that command.');
    }
}