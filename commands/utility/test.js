const config = require("../../privateData/config.json");

exports.name = "test";

exports.description = "Tests if the bot is up an operational.";

exports.usage = "not much to do..."


exports.run = (client, message) => {
    message.channel.send("🌐 This Bot is working as intended!");
}