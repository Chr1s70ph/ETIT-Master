var private = require('../private.js');
const discord = require('../node_modules/discord.js');
const serverId = private.serverId;
const botUserID = private.botUserID;
const fs = require("fs");
var list = ("./birthdayList.txt");

exports.birthdayEntry = birthdayEntry;

var dateIsValid = false;



async function birthdayEntry(client, dateIsValid) {
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


    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        if (command === 'geburtstag') {
            

            var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot
                
            const responseEmbed = new discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Geburtstagseintrag')
                .setAuthor('ETIT-Master', Avatar)
                .setThumbnail('https://lynnvalleycare.com/wp-content/uploads/2018/03/First-Birthday-Cake-PNG-Photos1.png')
                .addFields(
                    { name: 'Geburtstag gesetzt auf:', value: args[0].value + '.' + args[1].value + '.' + args[2].value}
            )
            
            isValid = ckeckDate(args, dateIsValid);
            if (isValid == true) {                    
                await client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 5,
                        data: {
                            content: '<@' + interaction.member.user.id + '>\n',            
                            embeds: [
                                responseEmbed
                            ]
                        }
                    }
                })                           
            }
        }
    })
}



function ckeckDate(args, dateIsValid) {
    foo = args[1].value + '-' + args[0].value + '-' + args[2].value;
    var test = new Date(foo);
    console.log(test);
    if (test != "Invalid Date") {
        dateIsValid = true;  
        console.log(dateIsValid);
        return dateIsValid;
    } else {
        dateIsValid = false;
        return dateIsValid;
    }
}


// var content = message.content;
// var command = content.substring(content.indexOf(" ") + 1);
// command = String(command);

// var date = command.split('.');
// foo = date[1] + "-" + date[0] + "-" + date[2];
// var test = new Date(foo);
// console.log(date);

// message.channel.send(String(test));
