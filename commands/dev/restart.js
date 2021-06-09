const pm2 = require('pm2');
const config = require("../../privateData/config.json");

exports.run = (client, message) => {
    if (message.author != config.ids.userID.ownerID) return message.reply('You do not have the permissions to perform that command.');

    message.channel.send("🤖Restarting...")
    pm2.connect(function (err) {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.restart('0', (err, proc) => {})
        pm2.flush('0', (err, proc) => {})
        pm2.restart('0', (err, proc) => {})

    });

}