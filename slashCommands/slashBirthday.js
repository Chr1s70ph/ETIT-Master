var private = require('../private.js');
const discord = require('../node_modules/discord.js');
const util = require('util');
const serverId = private.serverId;
const botUserID = private.botUserID;
const fs = require("fs");


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
                            name: "April",
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
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        var dateIsValid = false;
        var userID = interaction.member.user.id;
        
        if (command === 'geburtstag') {
            if (dateCheck(dateIsValid, args, client) == true) {



                const responseEmbed = new discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Geburtstagseintrag')
                    .setAuthor('ETIT-Master', client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL())
                    .setThumbnail('https://raw.githubusercontent.com/Chr1s70ph/ETIT-Master-JS/master/images/Cake.png')
                    .addFields(
                        { name: 'Geburtstag gesetzt auf:', value: '```json\n' + util.inspect(args[0].value) + util.inspect(args[1].value) + util.inspect(args[2].value) + '```' }
                    )



                await client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: '<@' + userID + '>\n',   
                            embeds: [
                                responseEmbed
                            ]
                        }
                    }
                });
                addBirthday(args, userID, birthdayData, client);
            }
            else {
                await client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: "<@" + userID + "> Kein zulässiges Datum"
                        }
                    }
                })
            }
        }
    });
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
    const foo = new discord.MessageEmbed()
        .setColor('#654321')
        .setAuthor('ETIT-Master',  client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL())
        .addFields({ name: '[DEBUG] Liste der Geburtstäge:', value: '```json\n' + require('util').inspect(birthdayData) + '```'} )

    client.channels.cache.get('821657681999429652').send(foo);            
}



//checks if date is valid
function checkDate(dateIsValid, args) {
    var checkCheck = new Date(args[2].value ,args[1].value -1 ,args[0].value);
    return checkCheck != "Invalid Date";
}

//makes sure, entered year is not too far in the past
function maxYearDifference(args) {
    var today = new Date();
    var enteredDay = new Date(args[2].value, args[1].value - 1, args[0].value);
    if (today.getFullYear() - args[2].value <= 50) {
        return true;
    } else return false;
}

//makes sure, entered date is not too close to the current year
function minYearDifference(args) {
    var today = new Date();
    var enteredDay = new Date(args[2].value, args[1].value - 1, args[0].value);
    if (today.getFullYear() - args[2].value >= 15 && enteredDay < today) {
        return true;
    } else return false;
}

//check for leap year
function leapYear(args)
{
    return ((args[2].value % 4 == 0) && (args[2].value % 100 != 0)) || (args[2].value % 400 == 0);
}

//check if date is valid based on a leap year
function validDay(args) {

    var day = args[0].value
    var month = args[1].value
    // the max value a day can have
    var maxDay = 31

    const february = 2

    // list of months with 30 days
    const months_30 = [4, 6, 9, 11]

    var isLeapYear = leapYear(args)

    // check if day is positive
    if (day <= 0) {
        return false
    }

    //check for special case february
    if (month == february) {

        maxDay = 28

        if (isLeapYear) {
            //leapyears have 29 days in february
            maxDay = 29
        }
    }

    if (month in months_30) {
        maxDay = 30
    }

    return day <= maxDay
}

//executes all date checks
function dateCheck(dateIsValid, args, client) {
    if (checkDate(dateIsValid, args, client) == true && maxYearDifference(args) == true && minYearDifference(args) == true && validDay(args) == true) {
        return true;
    } else return false;
}