var private = require('../private.js');
const ownerId = private.ownerID;
exports.run = (client, message) => {
    if (message.author == ownerId) {
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
        message.channel.return('You do not have the permissions to perform that command.');
    }
}