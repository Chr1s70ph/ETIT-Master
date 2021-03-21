var private = require('./private.js');
var schedule = require('node-schedule');
var reminder = require("./startupScripts/_Schedule.js");
var config = require("./startupScripts/loadConfig.js")
var loginMessage = require("./loginMessage.js")
var birthday = require("./startupScripts/birthdayPing.js");
var slashCommands = require("./startupScripts/slashCommands.js")
const discord = require('./node_modules/discord.js');
const client = new discord.Client();
const fs = require("fs");
const token = private.token;

client.commands = new discord.Collection();
client.aliases = new discord.Collection();
client.events = new discord.Collection();

client.on("ready", () => {
    Presence();
    reminder.WeekPlanReminder(client);
    slashCommands.postAndRun(client);
    loginMessage.display(client);
    console.log("Online!");
    
    birthday.CheckforBirthday(client);
});

client.login(token);


//Commands "handler"
fs.readdir("./commands/", (err, files) => {
    if (err) return console.log(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        console.log("Successfully loaded " + file)
        let commandName = file.split(".")[0];
        client.commands.set(commandName, props);
    });
});

//Events "handler"
fs.readdir('./events/', (err, files) => {
    if (err) console.log(err);
    files.forEach(file => {
        let eventFunc = require(`./events/${file}`);
        console.log("Successfully loaded " + file)
        let eventName = file.split(".")[0];
        client.on(eventName, (...args) => eventFunc.run(client, ...args));
    });
});

function Presence() {
    client.user.setPresence({
        status: "online",  // You can show online, idle... Do not disturb is dnd
        activity: {
            name: ".help",  // The message shown
            type: "LISTENING" // PLAYING, WATCHING, LISTENING, STREAMING,
        }
    });     

    var Timer = schedule.scheduleJob('15 * * * * *', function () {
        client.user.setPresence({
            status: "online",  // You can show online, idle... Do not disturb is dnd
            activity: {
                name: ".help",  // The message shown
                type: "LISTENING" // PLAYING, WATCHING, LISTENING, STREAMING,
            }
        });  
    });
}

function foo() {
    fs.readFile('./startupScripts/loadConfig.js', 'utf8' , (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        console.log(config.Wartungsarbeiten);
        if (config.Wartungsarbeiten === true) {
            console.log('abc');
        } else console.log('cdf');
    })
}