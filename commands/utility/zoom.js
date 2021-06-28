const config = require("../../privateData/config.json");

exports.name = "zoom";

exports.description = "Schickt ein Emoji, das beschreibt, worin Zoom am besten ist...";

exports.usage = `${config.prefix}zoom`


exports.run = (client, message) => {
    message.channel.send("<a:loading:783688114509578271>")
}