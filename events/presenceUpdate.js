const private = require('../private.js');
const discord = require('../node_modules/discord.js');



exports.run = async (client, oldPresence, newPresence) => {

    let member = newPresence.member;
    //UserID to track
    if (member.id === private.eTITChef) {

        try {
            if (oldPresence.status !== newPresence.status) {
    
                //creates emergency Embed in case ETIT-Chef is offline
                const emergency = new discord.MessageEmbed()
                    .setColor('#8B0000')
                    .setTitle('Der ETIT-Chef ist Offline!!')
                    .setAuthor('Offline Detector', client.guilds.resolve(private.serverId).members.resolve(private.botUserID).user.avatarURL())
                    .setThumbnail('https://wiki.jat-online.de/lib/exe/fetch.php?cache=&media=emoticons:lupe.png')
                    .addFields(
                        { name: 'Leonard eile zur Hilfe!', value: 'Wir brauchen dich!' }
                        
                    )
    
                let channel = client.channels.cache.get(private.botTestLobby)
                var leonard = private.leonard;
                var eTITChef = private.eTITChef;
    
                if (newPresence.status === "offline") {
                    
                    channel.send('<@' + private.leonard + '>', emergency);
                    // channel.send('<@' + private.leonard + '>', emergency);
    
                } else if (newPresence.status === "online") {
    
                    return;
    
                }
    
            }      
            
        } catch (e) {
            console.log(e);
        }
        
    }
}

