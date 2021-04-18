const config = require('../privateData/config.json');


exports.run = (client, message) => {
    if (message.author == config.ids.userID.ownerID) {
        var content = message.content;

        var command = content.substring(content.indexOf(" ") + 1);
        try {
            message.delete()
        } catch (error) {
            console.error(error);
        }
        message.channel.send(command);
    } else
    {
        try {
            message.delete()
        } catch (error) {
            console.error(error);
        }
        message.reply('You do not have the permissions to perform that command.');
    }
}