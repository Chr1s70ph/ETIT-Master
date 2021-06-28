const config = require("../../privateData/config.json");

exports.name = "test";

exports.description = "Prüft ob der Bot online und funktionstüchtig ist.";

exports.usage = `${config.prefix}test`


exports.run = (client, message) => {
    message.channel.send("🌐 This Bot is working as intended!");
}