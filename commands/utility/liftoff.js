const config = require("../../privateData/config.json");

exports.name = "liftoff";

exports.description = "Liftoff celebration";

exports.usage = `${config.prefix}liftoff`


exports.run = (client, message) => {
    message.channel.send("Hurraaa 🚀🚀");
}