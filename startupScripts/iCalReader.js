const ical = require('node-ical');
var private = require('../private.js');

exports.iCalReader = iCalReader;


function iCalReader(client) {
    // do stuff in an async function
    ;(async () => {
        // you can also use the async lib to download and parse iCal from the web
        const webEvents = await ical.async.fromURL(private.iCal);
        // console.log(webEvents);
        debug(client, webEvents)
    })()
        .catch(console.error.bind());

}

function debug(client, webEvents) {
    list = '';
    for (var entry in webEvents) {
        if (webEvents[entry].summary == undefined || webEvents[entry].start == undefined) {
            continue;
        } else {
            try {
                var events = webEvents[entry].summary;
                var dates = webEvents[entry].start;
                let d = new Date(Date(dates));
                d = d.toDateString();
                console.log('events: ' + events + ' dates: ' +  d + '\n');
                list = list = list + 'events: ' + events + ' dates:' + d + '\n';
            }
            catch (e) {
                console.log(e);            
            }
        }
    }
    client.channels.cache.get('770276625040146463').send(list, {split: true});
    

}