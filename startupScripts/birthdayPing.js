var fs = require("fs");
var discord = require('discord.js');
const config = require("../privateData/config.json");
const schedule = require('node-schedule');




exports.run = async (client) => {
    const cronDate = "30 0 0 * * *"
    //reads the JSON file and assings it to value
    var json = fs.readFileSync('./privateData/birthdayList.json', 'utf8', (err, data) => {
        if (err) {
            message.channel.send(err)
            return;
        }
    });


    //Checks for birthdays,and count the years
    var jsonDates = JSON.parse(json);
    for (var entry in jsonDates) {
        dateToCheck = jsonDates[entry].date;
        if (checkForToday(dateToCheck) == true) {
            var embed = createEmbed(client, jsonDates[entry].NutzerId, age(dateToCheck));
            var job = schedule.scheduleJob(cronDate, function () {
                client.channels.cache.get('821657681999429652').send(embed.setTimestamp())
                    .then(msg => msg.delete({
                        timeout: 5400000
                    }))
            });
        }
    }

}


function createEmbed(client, name, age) {
    const birthday = new discord.MessageEmbed() //Login Embed
        .setColor('#8fff8f')
        .setAuthor(client.user.tag, 'https://www.iconsdb.com/icons/preview/orange/code-xxl.png')
        .setThumbnail(client.guilds.resolve(config.ids.serverID).members.resolve(config.ids.userID.botUserID).user.avatarURL())
        .setTitle(`Geburtstag🥳`)
        .addFields({
            name: `Alles Gute zum Geburtstag!`,
            value: `<@${name}> wird heute ${age} Jahre alt🥳`,
            inline: true
        })
        .setFooter(`[ID] ${config.ids.userID.botUserID} \nstarted`, 'https://image.flaticon.com/icons/png/512/888/888879.png');

    return birthday;
}


//This function returns true, for any date from the list, that matches the current day
function checkForToday(dateToCheck) {
    var today = new Date();
    today = today.toDateString().slice(4, -5);
    dateToCheck = dateToCheck.slice(4, -5);
    return (today === dateToCheck)
}

//checks how long the birthday is in the past
function age(dateToCheck) {
    var today = new Date();
    currentYear = today.toDateString().slice(11);
    birthdayYear = dateToCheck.slice(11);
    return (currentYear - birthdayYear)
}