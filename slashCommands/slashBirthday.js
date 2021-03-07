var private = require('../private.js');
const discord = require('../node_modules/discord.js');
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
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        var dateIsValid = false;
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
                
            date = args[1].value + '-' + args[0].value + '-' + args[2].value;
            userID = interaction.member.user.id;
            isValid = ckeckDate(dateIsValid, date);
            addBirthday(date, userID, birthdayData);
            if (isValid == true) {                    
                // await client.api.interactions(interaction.id, interaction.token).callback.post({
                //     data: {
                //         type: 5,
                //         data: {
                //             content: '<@' + interaction.member.user.id + '>\n',            
                //             embeds: [
                //                 responseEmbed
                //             ]
                //         }
                //     }
                // })                           
            }
        }
    })
}

function ckeckDate(dateIsValid, date) {
    
    var date = new Date(date);
    console.log(date);
    if (date != "Invalid Date") {
        dateIsValid = true;  
        console.log(dateIsValid);
        return dateIsValid;
    } else {
        dateIsValid = false;
        return dateIsValid;
    }
}

function addBirthday(date, userID, birthdayData) {

    birthdayData[userID] = {
        NutzerId: userID,
        date: new Date(date)
    };
    let text = JSON.stringify(birthdayData);
    fs.writeFile('./birthdayList.json', text, function (err){
        if (err) throw err;
    });

    for (var entry in birthdayData) {
        // console.log(entry.NutzerId + " " + entry.date)
        console.log(birthdayData[entry])
    }
}



// let id = ""

// let dict = {};

// dict[id] = { date: new Date() }

// for (var entry in dict) {
//     if (entry["date"] == DateToday);

//     delete dict[id];
// }


// @12PM::
// str = JSON.stringify(dict);
// dict = JSON.parse(str);