const schedule = require('node-schedule');
const reminder = require("./startupScripts/_Schedule.js");
const reader = require("./startupScripts/iCalReader.js");
const loginMessage = require("./startupScripts/loginMessage.js")
const birthday = require("./startupScripts/birthdayPing.js");
const slashCommands = require("./startupScripts/slashCommands.js")

const config = require("./privateData/config.json")
const discord = require('./node_modules/discord.js');
const client = new discord.Client();
const fs = require("fs");
const presence_refresh_timer = "15 * * * * *"

client.commands = new discord.Collection();
client.aliases = new discord.Collection();
client.events = new discord.Collection();

client.on("ready", () => {
    Presence();
    foo(client);
});


async function foo(client) {
    await loadScripts(client);        
    console.log("Online!");
}


client.login(config.botToken);


//Commands "handler"
fs.readdir("./commands/", (err, files) => {
    if (err) return console.log(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        console.log("Successfully loaded command " + file)
        let commandName = file.split(".")[0];
        client.commands.set(commandName, props);
    });
});

//Events "handler"
fs.readdir('./events/', (err, files) => {
    if (err) console.log(err);
    files.forEach(file => {
        let eventFunc = require(`./events/${file}`);
        console.log("Successfully loaded event " + file)
        let eventName = file.split(".")[0];
        client.on(eventName, (...args) => eventFunc.run(client, ...args));
    });
});

/**
 * 
 * @param {object} client necessary to start scripts relying on client
 */
async function loadScripts(client) {
    let files;
    try {        
        files = await fs.promises.readdir('./startupScripts/')
    } catch(e) {
        console.log(e);
    }
    files.forEach(file => {
        let script = require(`./startupScripts/${file}`);
        console.log("Successfully loaded startupScript " + file)
        script.run(client);
    });
}


function Presence() {
    client.user.setPresence(config.presence);     

    schedule.scheduleJob(presence_refresh_timer, function () {
        client.user.setPresence(config.presence);
    });
}