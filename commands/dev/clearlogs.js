const pm2 = require('pm2');
const config = require("../../privateData/config.json");

exports.run = (client, message) => {
    if (message.author != config.ids.userID.ownerID) return message.reply('You do not have the permissions to perform that command.');

    pm2.connect(function (err) {
        if (err) {
            console.error(err);
            process.exit(2);
        }
        message.channel.send("🤖Deleting logs...")
        pm2.flush('index', (err, proc) => {})
    });

}