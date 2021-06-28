const {createCanvas, loadImage} = require('canvas');
const request = require("node-superfetch")
const Discord = require('../../node_modules/discord.js');
const config = require("../../privateData/config.json");


exports.name = "deepfry";

exports.description = "Deepfried Bilder";

exports.usage = `Schicke ein Bild und nutze ${config.prefix}deepfry`;


exports.run = async (client, message, args) => {
    let image = message.attachments.size > 0 ? message.attachments.array()[0].url : null
    if (image === undefined) return message.channel.send("Bitte lade ein Bild hoch");

    try {
        const data = await loadImage(image);
        const canvas = createCanvas(500, 500);
        const context = canvas.getContext("2d");
        context.drawImage(data, 0, 0, canvas.width, canvas.height);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
        message.channel.send(attachment);

        //NOT FINNISHED

    } catch (e) {
        console.log(e);
    }
}