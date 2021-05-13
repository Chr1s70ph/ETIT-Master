const config = require('../privateData/config.json');
const discord = require('../node_modules/discord.js');


exports.run = async (client, oldPresence, newPresence) => {

    var etitChef = config.ids.userID.etitChef;
    let member = newPresence.member;
    //UserID to track
    if (member.id === etitChef) {
        try {
            if (oldPresence.status !== newPresence.status) {
                //creates emergency Embed in case ETIT-Chef is offline
                const emergency = new discord.MessageEmbed()
                    .setColor('#8B0000')
                    .setTitle('Der ETIT-Chef ist Offline!!')
                    .setAuthor('Offline Detector', client.guilds.resolve(config.ids.serverID).members.resolve(config.ids.userID.botUserID).user.avatarURL())
                    .setThumbnail('https://wiki.jat-online.de/lib/exe/fetch.php?cache=&media=emoticons:lupe.png')
                    .addFields({
                            name: 'Leonard eile zur Hilfe!',
                            value: 'Wir brauchen dich!'
                        }

                    )

                let channel = client.channels.cache.get(config.ids.channelIDs.dev.botTestLobby)
                var leonard = config.leonard;
                var eTITChef = config.eTITChef;

                if (newPresence.status === "offline") {

                    // client.channels.cache.get('770276625040146463').send(`<@${config.ids.userID.leonard}>` + emergency);
                    client.channels.cache.get('770276625040146463').send('<@' + config.ids.userID.leonard + '>', emergency);

                } else if (newPresence.status === "online") {

                    return;

                }

            }

        } catch (e) {
            console.log(e);
        }

    }
}