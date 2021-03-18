var private = require('../private.js');
const discord = require('../node_modules/discord.js');
const serverId = private.serverId;
const botUserID = private.botUserID;
const fs = require("fs");
const { BitField } = require('discord.js');
var schedule = require('node-schedule');


exports.birthdayEntry = birthdayEntry;



async function birthdayEntry(client, listData) {

    await client.api.applications(client.user.id).guilds(serverId).commands.post({
        data: {
            name: "Geburtstag",
            description: "Trage deinen Geburtstag ein, und erhalte Glückwünsche vom Bot!",
            type: 2,
            options: [
                {
                    name: "Tag",
                    description: "Der Tag an dem du geboren bist:",
                    type: 4,
                    required: true
                },
                {
                    name: "Monat",
                    description: "Der Monat in dem du geboren bist:",
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: "Januar",
                            value: "01"
                        },
                        {
                            name: "Februar",
                            value: "02"
                        },
                        {
                            name: "März",
                            value: "03"
                        },
                        {
                            name: "Aprill",
                            value: "04"
                        },
                        {
                            name: "Mai",
                            value: "05"
                        },
                        {
                            name: "Juni",
                            value: "06"
                        },
                        {
                            name: "Juli",
                            value: "07"
                        },
                        {
                            name: "August",
                            value: "08"
                        },
                        {
                            name: "September",
                            value: "09"
                        },
                        {
                            name: "Oktober",
                            value: "10"
                        },
                        {
                            name: "November",
                            value: "11"
                        },
                        {
                            name: "Dezember",
                            value: "12"
                        }
                    ]
                },
                {
                    name: "Jahr",
                    description: "Das Jahr in dem du geboren bist:",
                    type: 4,
                    required: true
                }
            ]
        }
    });


    var text = fs.readFileSync("./birthdayList.json").toString('utf-8');
    let birthdayData = JSON.parse(text);
    // let birthdayData = { };


    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        
        //creates current date and converts it to DateString
        var today = new Date();
        today = today.toDateString()

        //reads the JSON file and assings it to value
        var json = fs.readFileSync('./birthdayList.json', 'utf8' , (err, data) => {
            if (err) {
                message.channel.send(err) 
                return;
            }
        });
    

        //Checks for birthdays, still needs to be automated and count the years
        var jsonDates = JSON.parse(json);
        for (var entry in jsonDates) {
            dateToCheck = jsonDates[entry].date;
            if (checkForToday(dateToCheck) == true) {
                client.channels.cache.get('770276625040146463').send("<@" + jsonDates[entry].NutzerId + "> hat heute geburtstag :D");
            }
        }






        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        var dateIsValid = false;
        if (command === 'geburtstag') {
            //get userID of user who issued command
            userID = interaction.member.user.id;
            isValid = ckeckDate(dateIsValid, args, client);

            //dynamic embed with date
            const responseEmbed = new discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Geburtstagseintrag')
            .setAuthor('ETIT-Master', client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL())
            .setThumbnail('https://lynnvalleycare.com/wp-content/uploads/2018/03/First-Birthday-Cake-PNG-Photos1.png')
            .addFields(
                { name: 'Geburtstag gesetzt auf:', value: '```json\n' + (new Date(args[2].value ,args[1].value -1 ,args[0].value)).toDateString() + '```'}                
            )
            //When date is valid, send embed
            //else send message it is not valid
            if (isValid == true) {
                await client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 5,
                        data: {
                            content: '<@' + userID + '>\n',            
                            embeds: [
                                responseEmbed
                            ]
                        }
                    }
                })                           
            } else {
                await client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 5,
                        data: {
                            content: "<@" + userID + "> Kein zulässiges Datum"
                        }
                    }
                }) 
            }
            addBirthday(args, userID, birthdayData, client);            
        }
    })
}

//checks if date is valid
function ckeckDate(dateIsValid, args, client) {
    var checkCheck = new Date(args[2].value ,args[1].value -1 ,args[0].value);
    console.log(checkCheck);
    return checkCheck != "Invalid Date";
}


function addBirthday(args, userID, birthdayData, client) {
    //converts date to JSON and writes to birdtayList.json
    birthdayData[userID] = {
        NutzerId: userID,
        date: (new Date(args[2].value, args[1].value - 1, args[0].value)).toDateString()
    };
    
    fs.writeFile('./birthdayList.json', JSON.stringify(birthdayData), function (err){
        if (err) throw err;
    });

    //create and sends debug embed with all entrys from birthdayList.json
    // creates debug embed with
    const foo = new discord.MessageEmbed()
        .setColor('#654321')
        .setAuthor('ETIT-Master',  client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL())
        .addFields({ name: '[DEBUG] Liste der Geburtstäge:', value: '```json\n' + require('util').inspect(birthdayData) + '```'} )

    client.channels.cache.get('821657681999429652').send(foo);            
}

//This function returns true, for any date from the list, that matches the current day
function checkForToday(dateToCheck) {
    var today = new Date();
    today = today.toDateString().slice(8);
    dateToCheck = dateToCheck.slice(8);
    return(today === dateToCheck)
}