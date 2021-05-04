const pm2 = require('pm2');
const config = require("../privateData/config.json")

exports.run = (client, message) => {


    if (message.author == config.ids.userID.ownerID) {
        try {
            message.delete()
        } catch (error) {
            console.error(error);
        }
        message.channel.send("🤖Restarting...")
        pm2.connect(function(err) {
            if (err) {
                console.error(err);
                process.exit(2);
            }
            pm2.restart('index', (err, proc) => {
            })
        });
        
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