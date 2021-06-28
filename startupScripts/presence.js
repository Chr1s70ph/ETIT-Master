
const schedule = require('node-schedule');
const config = require('../privateData/config.json');
const presence_refresh_timer = "15 * * * * *"
const custom_presence = require("../commands/moderation/status.js")

exports.run = async (client) => {

    var maxNumberOfPresence = Object.keys(config.presence).length;
    var minNumberOfPresence = 0;
    const presenceVariants = config.presence;
    var keys = Object.keys(presenceVariants);

    schedule.scheduleJob(presence_refresh_timer, function () {

        let customPresence = custom_presence.presence;
        if (customPresence.activity.name != "") {

            client.user.setPresence(customPresence);

        } else {

            var randomIndex = Math.floor(Math.random() * (maxNumberOfPresence - minNumberOfPresence) + minNumberOfPresence)
            client.user.setPresence(presenceVariants[randomIndex]);

        }

    });

}
