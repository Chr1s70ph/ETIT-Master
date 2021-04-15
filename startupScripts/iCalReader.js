const private = require('../private.js');
const ical = require('node-ical');
const discord = require('../node_modules/discord.js');
const util = require('util');
const serverId = private.serverId;
const botUserID = private.botUserID;
var embed = '';


exports.iCalReader = iCalReader;


function iCalReader(client) {
    // do stuff in an async function
    ;(async () => {
        // you can also use the async lib to download and parse iCal from the web
        const webEvents = await ical.async.fromURL(private.iCal);
        // console.log(webEvents);
        // client.channels.cache.get('770276625040146463').send(util.inspect(webEvents), {split: true});
        filterToadaysEvents(client, webEvents)
    })()
        .catch(console.error.bind());

}

function filterToadaysEvents(client, webEvents) {
    list = '';
    for (var entry in webEvents) {
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
                    link = extractLinks(description);

                    var time = dates;

                    dynamicEmbed(client, subject, professor, link, time);
                }
            }
            catch (e) {
                console.log(e);            
            }
        }
    }
    

}

//Checks if entered Date is equal to current date
//Trimmed down to "WEEKDAY MONTH DAY YEAR" to compare the exact day, and not time
function checkForToday(dateToCheck){
    var today = new Date().toString().slice(0, -49);
    dateToCheck = dateToCheck.toString().slice(0, -49);
        return(today === dateToCheck)
}



//This function extracts the zoom Links from HTML tag
//if the HTML tag contains "#success" it cuts the string before that string, to make the link automatically open zoom 
function extractLinks(description) {
    if (description.length != 0) {
        if (description.includes('#success')) {

            return link = description.split('<a href=')[1].split('#success')[0];

        } else {

            return link = description.split('<a href=')[1].split('>')[0];

        }
    }
}



function dynamicEmbed(client, subject, professor, link, time) {
    if (link.length != 0) {
        
        embed = new discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(subject + ' Vorlesung')
                .setURL(link)
                .setAuthor(subject + ' Reminder', client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL())
                .setDescription('Die ' + subject + ' fängt in 5 Minuten an')
                .setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
                .addFields(
                    { name: 'Die '+ subject + ' findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Dozent', value: professor, inline: true },
                    { name: 'Zeit', value: time, inline: true },
                )
            .setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL());
    }
    else {
        
        embed = new discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(subject + ' Vorlesung')
                .setAuthor(subject + ' Reminder', client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL())
                .setDescription('Die ' + subject + ' fängt in 5 Minuten an')
                .setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
                .addFields(
                    { name: 'Die '+ subject + ' findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Dozent', value: professor, inline: true },
                    { name: 'Zeit', value: time, inline: true },
                )
            .setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL());
        
    }
        
    client.channels.cache.get('770276625040146463').send(embed);
}
