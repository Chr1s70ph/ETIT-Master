var fs = require("fs");
var private = require('../private.js');
var config = require("../startupScripts/loadConfig.js")
const ownerID = private.ownerID;

exports.run = (client, message) => {
    if (message.author == ownerID) {
        fs.readFile('./startupScripts/loadConfig.js', 'utf8' , (err, data) => {
            if (err) {
                message.channel.send(err) 
                return;
            }
            if (args == "false") {
                fs.writeFile('./startupScripts/loadConfig.js', 'exports.Wartungsarbeiten = Wartungsarbeiten = false;', function (err) {
                    if (err) throw err;
                    console.log('set value to false!');
                })
            }else if (args == "true") {
                fs.writeFile('./startupScripts/loadConfig.js', 'exports.Wartungsarbeiten = Wartungsarbeiten = true;', function (err) {
                    if (err) throw err;
                    console.log('set value to true!');
                })
            }
        })
        } else  message.channel.send("You cannot do this") 
}