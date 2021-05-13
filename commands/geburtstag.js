const fs = require("fs");
const discord = require('../node_modules/discord.js');
const config = require('../privateData/config.json');
const botUserID = config.ids.userID.botUserID;
const serverID = config.ids.serverID;



exports.run = (client, message, args) => {
    var Avatar = client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot    
    var userID = message.author.id;

    if (args.length == 0) {

        birthdayInfo(client, message, Avatar);

    } else if (args == "löschen") {
        var birthdayData = JSON.parse(fs.readFileSync("./privateData/birthdayList.json").toString('utf-8'))

        if (hasUserEntry(userID, birthdayData, client) == true) {

            britdayDeleted(client, message, Avatar);

            deleteUserBirthday(userID, birthdayData, client);

        } else {

            userIdNotInJSON(client, message);

        }
    }

}

function hasUserEntry(userID, birthdayData, client) {

    for (var entry in birthdayData) {
        if (birthdayData[entry].NutzerId == userID) {
            return true;
        }
    }
    return false;
}

function deleteUserBirthday(userID, birthdayData, client) {
    delete birthdayData[userID];
    fs.writeFile('./birthdayList.json', JSON.stringify(birthdayData), function (err) {
        if (err) {
            client.message.send("Ein Fehler beim löschen ist aufgetreten!");
            throw err;
        }
    });
}


function birthdayInfo(client, message, Avatar) {


    const infoEmbed = new discord.MessageEmbed()
        .setColor('	#008000')
        .setTitle('Geburtstags Erinnerung')
        .setAuthor('ETIT-Master', Avatar)
        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/d/dd/Gray_book.png')
        .addFields({
                name: 'Benutzung',
                value: '\u200B'
            }, {
                name: 'Verwende `/geburtstag` um deinen Geburtstag hinzu zu fügen',
                value: '\u200B'
            }, {
                name: 'Löschen',
                value: `Um deinen geburtstag zu löschen, nutze \`${config.prefix}geburtstag löschen\``
            }

        )

    message.channel.send(infoEmbed);
}


function britdayDeleted(client, message, Avatar) {

    const britdayDeleted_Embed = new discord.MessageEmbed()
        .setColor('	#008000')
        .setTitle('Geburtstag Gelöscht!')
        .setAuthor('ETIT-Master', Avatar)
        .setThumbnail('https://cdn.discordapp.com/attachments/821657681999429652/825154162944638996/Mulleimer.png')
        .addFields({
                name: 'Dein Eintrag wurde erfolgreich gelöscht',
                value: 'Du kannst deinen Geburtstag ernuet mir `/geburstag` hinzufügen!'
            },

        )

    message.channel.send(britdayDeleted_Embed);
}

function userIdNotInJSON(client, message) {
    var Avatar = client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

    const userIdNotInJSON_Embed = new discord.MessageEmbed()
        .setColor('#FF0000')
        .setTitle('UserID Nicht Gefunden!')
        .setAuthor('ETIT-Master', Avatar)
        .addFields({
            name: 'Dein Eintrag konnte nicht gelöscht werden',
            value: 'Um deinen Geburtstag zu löschen, musst du ihn erst mit `/geburstag` hinzufügen!'
        }, )

    message.channel.send(userIdNotInJSON_Embed);
}