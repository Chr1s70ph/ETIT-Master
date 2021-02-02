var private = require('../private.js');
const discord = require('../node_modules/discord.js');
const serverId = private.serverId;
const botUserID = private.botUserID;
const links = private.links;

exports.info = info;

async function info(client) {
    await client.api.applications(client.user.id).guilds(serverId).commands.post({
        data: {
            name: "info",
            description: "Gibt infos",    
            type: 2,
            options: [
                {
                    name: "Fach",
                    description: "Über welches Fach möchtest du etwas wissen?",
                    type: 3,
                    required: true,
                    choices: [
                        {                    
                            name: "Höhere Mathematik",
                            value: "hm"
                        },
                        {
                            name: "Experimental Physik",
                            value: "ex-phy"
                        },
                        {
                            name: "Digitaltechnik",
                            value: "dt"
                        },
                        {
                            name: "Lineare Elektrische Netze",
                            value: "len"
                        }
                    ]
                }
            ]
        }
    });   

    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        
        if (command === 'info') {
            await client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 5,
                    data: {
                        content: '<@' + interaction.member.user.id + '>\n'
                    }
                }
            });
            if (args[0].value === 'hm') {
                client.channels.cache.get(interaction.channel_id).send(matheInfo.setTimestamp());
            } else if (args[0].value === 'ex-phy') {
                client.channels.cache.get(interaction.channel_id).send(exPhyInfo.setTimestamp());
            } else if (args[0].value === 'dt') {
                client.channels.cache.get(interaction.channel_id).send(dTInfo.setTimestamp());
            }if (args[0].value === 'len') {
                client.channels.cache.get(interaction.channel_id).send(lENInfo.setTimestamp());
            }
        }
    });


    var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot
    
    const matheInfo = new discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Info Seite der HM1')
        .setAuthor('Hm1 Informationen', Avatar)
        .setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
        .addFields(
            { name: 'Die Vorlesung findet auf Zoom statt', value: 'Hier ist der [Link](' + links.hmZoom + ')'},
            { name: 'Die Fragestunde findet ebenfalls auf Zoom statt', value: 'Hier ist der [Link](' + links.hmuZoom + ')' },
            { name: 'Ilias', value: 'Hier ist der Link zum [Ilias](' + links.hmIlias + ')'},
            { name: '\u200B', value: '\u200B' },
            { name: 'Dozent', value: 'Ioannis Anapolitanos', inline: true },
            { name: 'Assistent', value: 'Semjon Wugalter', inline: true },
        )
    
    const exPhyInfo = new discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Info Seite der Experimental-Physik')
        .setAuthor('Experimental-Physik Informationen', Avatar)
        .setThumbnail('https://i.pinimg.com/originals/de/1c/91/de1c91788be0d791135736995109272a.png')
        .addFields(
            { name: 'Die Vorlesung findet auf Youtube statt', value: 'Hier ist der [Link](' + links.pyYouTube + ') zur Youtube Playlist'},
            { name: 'Ilias', value: 'Hier ist der Link zum [Ilias](' + links.phyIlias + ')'},
            { name: '\u200B', value: '\u200B' },
            { name: 'Dozent', value: 'Thomas Schimmel', inline: true },
            { name: 'Assistent', value: 'Schwerkraftaus Schubi', inline: true },
        )
    
    const dTInfo = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Info Seite der Digitaltechnik')
		.setAuthor('Digitaltechnik Informationen', Avatar)
		.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
        .addFields(
            { name: 'Die Vorlesung findet auf Zoom statt', value: 'Hier ist der [Link](' + links.dtZoom + ')' },
            { name: 'Ilias', value: 'Hier ist der Link zum [Ilias](' + links.dtIlias + ')'},
            { name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Jürgen Becker', inline: true },
			{ name: 'Assistent', value: 'Fabian Kempf', inline: true },
    )
    
    const lENInfo = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Info Seite der Linearen Elektrischen Netze')
		.setAuthor('LEN Informationen', Avatar)
		.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
        .addFields(
            { name: 'Die Vorlesung findet auf Zoom statt', value: 'Hier ist der [Link](' + links.lenZoom + ')' },            
            { name: 'Ilias', value: 'Hier ist der Link zum [Ilias](' + links.lenIlias + ')'},
            { name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Olaf Dössel', inline: true },
			{ name: 'Assistent', value: 'Alp Cehri', inline: true },
			{ name: 'Übungsleiter', value: 'Jochen Brenneisen', inline: true }
		)
}