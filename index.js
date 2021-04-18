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
    // reminder.WeekPlanReminder(client);
    reader.iCalReader(client);
    slashCommands.postAndRun(client);
    loginMessage.display(client);
    console.log("Online!");
    
    birthday.CheckforBirthday(client);
});

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

function Presence() {
    client.user.setPresence(config.presence);     

    schedule.scheduleJob(presence_refresh_timer, function () {
        client.user.setPresence(config.presence);
    });
}