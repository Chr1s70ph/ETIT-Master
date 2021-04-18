const ical = require('node-ical');
const discord = require('../node_modules/discord.js');
const config = require("../privateData/config.json");
const schedule = require('node-schedule');
const util = require('util');
var subjects = config.ids.channelIDs.subject;
var serverID = config.ids.serverID;
var botUserID = config.ids.userID.botUserID;
var debugChannel = config.ids.channelIDs.dev.botTestLobby;
var embed = '';



exports.run = async (client) => {
    // do stuff in an async function
    ;(async () => {
        // you can also use the async lib to download and parse iCal from the web
        const webEvents = await ical.async.fromURL(config.ical);
        filterToadaysEvents(client, webEvents);
    })()
        .catch(console.error.bind());
    
}

/**
 * 
 * @param {*} client 
 * @param {*} webEvents 
 */
function filterToadaysEvents(client, webEvents) {
    list = '';
    for (entry in webEvents) {
        if (webEvents[entry].summary == undefined || webEvents[entry].start == undefined) {
            continue;
        } else {
            try {
                var events = webEvents[entry].summary;

                var dates = webEvents[entry].start;

                var description = webEvents[entry].description;
                
                if (checkForToday(dates) == true) {

                    //extract the subject after the "-" in the string
                    var subject = events.split('-')[1]; 

                    //extract the professors Name before the "-" in the string 
                    var professor = events.split('-')[0];
                    // console.log(description);


                    var link = '';
                    //extract the link from an html hyperlink
                    link = extractZoomLinks(description);

                    var time = dates;

                    var cronDate = dateToCron(time);

                    embed = dynamicEmbed(client, subject, professor, link)

                    createCron(cronDate, findChannel(client, subject), embed, client);

                    client.channels.cache.get('770276625040146463').send(subject + time + link, { split: true });
                }
            }
            catch (e) {
                console.log(e);            
            }
        }
    }
    

}

/**
 * checks for today
 * 
 * @param {string} dateToCheck 
 * @returns {boolean} true if eneted day is today 
 */
function checkForToday(dateToCheck){
    var today = new Date().toString().slice(0, -49);
    dateToCheck = dateToCheck.toString().slice(0, -49);
        return(today === dateToCheck)
}



//This function extracts the zoom Links from HTML tag
//if the HTML tag contains "#success" it cuts the string before that string, to make the link automatically open zoom 
/**
 * 
 * @param {*} description 
 * @returns 
 */
function extractZoomLinks(description) {
    if (description.length == 0) {
        return 
    }
    let splitString = '>'
    if (description.includes('#success')) {
        splitString = '#success'
    }
    return description.split('<a href=')[1].split(splitString)[0];   
}

/**
 * 
 * @param {*} date 
 * @returns 
 */
function dateToCron(date) {
    //generate all needed variables for the CRON-Format
    //SECONDS MINUTES HOURS DAY_OF_MONTH MONTH DAY_OF_WEEK
    var seconds = '0';
    var minutes = '55';
    var hour = date.getHours() -1; //Subtract one, to give the alert not at the exact start of the event, but coupled with minutes = '55' 5 minutes earlier
    var dayOfMonth = '*'; //set to * so the Cron is for the current week
    var month = '*'; //set to * so the Cron is for the current week
    var day = date.getDay();  //Extracts the weekday of the date string

    var cronString = seconds + ' ' + minutes + ' ' + hour + ' ' + dayOfMonth + ' ' + month + ' ' + day;

    return cronString;
}

/**
 * Builds dynamic embed
 * 
 * Only returns an embed with link, when link is set
 * 
 * @param {var} client needed for the client Avatar
 * @param {string} subject used to set the Title and contents of the embed
 * @param {string} professor sets the professor
 * @param {string} link link to the lecture
 * @returns {object} Embed that was built using the given parameters
 */
function dynamicEmbed(client, subject, professor, link) {
    var Avatar = client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL();

    embed = new discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(subject + ' Vorlesung')
            .setAuthor(subject + ' Reminder', Avatar)
            .setDescription('Die ' + subject + ' fängt in 5 Minuten an')
            .setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
            .addFields(
                { name: 'Die '+ subject + ' findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
                { name: 'Dozent', value: professor, inline: false }
            )
        .setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL());
        
    if (link.length != 0) {

        embed.setURL(link);

    }
    return embed;
}

/**
 * returns channelID
 * 
 * analyzes the contents of the "subject" and sets "channel" based on its contents
 * sends in case of an error, said error to the debug channel
 * 
 * @param {var} client necessary to return error messages to debug channel
 * @param {String} subject subject exported from iCal
 * @return {string}     returns the channelID based on subject
 * 
 * @throws Error in debug channel
 */
function findChannel(client, subject) {
    var channel = "";
    if (subject.includes("Höhere Mathematik")) {

        channel = subjects.HM;
        return channel;

    } else if (subject.includes("Elektronische Schaltungen")) {

        channel = subjects.ES;
        return channel;

    } else if (subject.includes("Elektromagnetische Felder")) {

        channel = subjects.EMF;
        return channel;

    } else if (subject.includes("KAI")) {

        channel = subjects.KAI;
        return channel;

    } else if (subject.includes("Informationstechnik")) {

        channel = subjects.IT;
        return channel;
    } else {

        client.channels.cache.get(debugChannel).send("There was a problem, finding the subject and its channel");
        client.channels.cache.get(debugChannel).send(subject);

    }

}


//creates a dynamic Cron schedule
//needs a valid cronDate in the right format(eg https://crontab.guru/)
//needs a valid channelID to send the message to
//needs a message (here an embed, but generally it does not matter)
/**
 * 
 * @param {*} cronDate 
 * @param {*} channel 
 * @param {*} embed 
 * @param {*} client 
 */
function createCron(cronDate, channel ,embed, client) {
    var job = schedule.scheduleJob(cronDate, function () {
        client.channels.cache.get(channel).send('<@&' + config.ids.roleIDs.ETIT + '>', embed.setTimestamp())
        .then(msg => msg.delete({ timeout: 5400000 }))
    });
}