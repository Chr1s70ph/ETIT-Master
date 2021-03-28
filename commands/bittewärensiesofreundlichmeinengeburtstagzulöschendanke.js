const fs = require("fs");
const discord = require('../node_modules/discord.js');
var private = require('../private.js');
const botUserID = private.botUserID;
const serverId = private.serverId;



exports.run = (client, message) => {
    var userID = message.author.id;
    
    
    
    if (hasUserEntry(userID, client) == true) {
        britdayDeleted(client, message);
        deleteUserBirthday(userID);        
    } else {
        userIdNotInJSON(client, message);
    }
}

function hasUserEntry(userID, client) {
    var json = fs.readFileSync("./birthdayList.json").toString('utf-8');
    let birthdayData = JSON.parse(json);

    for (var entry in birthdayData) {
        if (birthdayData[entry].NutzerId == userID) {
            return true;
        }
    }
    return false;
}

function deleteUserBirthday(userID, client) {
    var json = fs.readFileSync("./birthdayList.json").toString('utf-8');
    let birthdayData = JSON.parse(json);
    
    delete birthdayData[userID];
    fs.writeFile('./birthdayList.json', JSON.stringify(birthdayData), function (err){
        if (err) {
            client.message.send("Ein Fehler beim löschen ist aufgetreten!");
            throw err;
        }
    });
}



function britdayDeleted(client, message) {
    var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot
    
    const britdayDeleted_Embed = new discord.MessageEmbed()
        .setColor('	#008000')
        .setTitle('Geburtstag Gelöscht!')
        .setAuthor('ETIT-Master', Avatar)
        .setThumbnail('https://cdn.discordapp.com/attachments/821657681999429652/825154162944638996/Mulleimer.png')
        .addFields(
            { name: 'Dein Eintrag wurde erfolgreich gelöscht', value: 'Du kannst deinen Geburtstag ernuet mir `/geburstag` hinzufügen!' },
                
    )
    
    message.channel.send(britdayDeleted_Embed);
}

function userIdNotInJSON(client, message) {
    var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot
    
    const userIdNotInJSON_Embed = new discord.MessageEmbed()
        .setColor('#FF0000')
        .setTitle('UserID Nicht Gefunden!')
        .setAuthor('ETIT-Master', Avatar)
        .addFields(
            { name: 'Dein Eintrag konnte nicht gelöscht werden', value: 'Um deinen Geburtstag zu löschen, musst du ihn erst mit `/geburstag` hinzufügen!' },        
    )
    
    message.channel.send(userIdNotInJSON_Embed);
}