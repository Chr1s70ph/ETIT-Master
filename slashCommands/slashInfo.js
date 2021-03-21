var private = require('../private.js');
const discord = require('../node_modules/discord.js');
const serverId = private.serverId;
const botUserID = private.botUserID;
const links = private.links;
var switchEmbed;

exports.info = info;

async function info(client) {
    await client.api.applications(client.user.id).guilds(serverId).commands.post({
        data: {
            name: "Info",
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
                            name: "Lineare Elektrische Netze",
                            value: "len"
                        },
                        {
                            name: "Digitaltechnik",
                            value: "dt"
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
            switch (args[0].value) {
                case "hm":
                    switchEmbed = matheInfo.setTimestamp();
                    break;
                case "ex-phy":
                    switchEmbed = exPhyInfo.setTimestamp();
                    break;
                case "len":
                    switchEmbed = lENInfo.setTimestamp();
                    break;
                case "dt":
                    switchEmbed = dTInfo.setTimestamp();
                    break;
            }
            await client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 5,
                    data: {
                        content: '<@' + interaction.member.user.id + '>\n',
                        embeds: [
                            switchEmbed
                        ]
                    }
                }
            });
        }
    });

    var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot
    
    const matheInfo = new discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Info Seite der HM1')
        .setAuthor('Hm1 Informationen', Avatar)
        .setThumbnail('https://images.emojiterra.com/twitter/v13.0/512px/1f4c8.png')
        .addFields(
            { name: 'Die Fragestunde findet ebenfalls auf Zoom statt', value: 'Hier ist der [Link](' + links.hmuZoom + ') <:zoom:776402157334822964>' },
            { name: 'Ilias', value: 'Hier ist der Link zur [Ilias](' + links.hmIlias + ') von der HM1 <:ilias:776366543093235712>'},
            { name: 'Altklausuren', value: '[Hier](' + links.hmOneDriveAK + ') sind ein paar Altklausuren auf Ondrive <:od:776371361185792030> \n[Hier](' + links.hmIliasAK + ') sind Links zu Altklausuren von Ioannis im Ilias <:ilias:776366543093235712>'},
            { name: '\u200B', value: '\u200B' },
            { name: 'Dozent', value: 'Ioannis Anapolitanos', inline: true },
            { name: 'Assistent', value: 'Semjon Wugalter', inline: true },
        )
    
    const exPhyInfo = new discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Info Seite der Experimental-Physik')
        .setAuthor('Experimental-Physik Informationen', Avatar)
        .setThumbnail('https://cdn-0.emojis.wiki/emoji-pics/microsoft/collision-microsoft.png')
        .addFields(
            { name: 'Die Vorlesung findet auf Youtube statt', value: 'Hier ist der [Link](' + links.phyYouTube + ') zur Youtube Playlist <:youtube:776400533203714048>'},
            { name: 'Ilias', value: 'Hier ist der Link zum [Ilias](' + links.phyIlias + ') von Physik <:ilias:776366543093235712>' },
            { name: 'Altklausuren', value: '[Hier](' + links.phyOneDriveAK + ') sind ein paar Altklausuren auf Ondrive <:od:776371361185792030> \n[Hier](' + links.phyIliasAK + ') sind die Altklausuren im Ilias <:ilias:776366543093235712>'},
            { name: '\u200B', value: '\u200B' },
            { name: 'Dozent', value: 'Thomas Schimmel', inline: true },
            { name: 'Assistent', value: 'Schwerkraftaus Schubi', inline: true },
        )
    
    const lENInfo = new discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Info Seite der Linearen Elektrischen Netze')
        .setAuthor('LEN Informationen', Avatar)
        .setThumbnail('https://images.emojiterra.com/twitter/v13.0/512px/1f50c.png')
        .addFields(
            { name: 'Die Vorlesung findet auf Zoom statt', value: 'Hier ist der [Link](' + links.lenZoom + ') <:zoom:776402157334822964>' },            
            { name: 'Ilias', value: 'Hier ist der Link zum [Ilias](' + links.lenIlias + ') von LEN <:ilias:776366543093235712>' },
            { name: 'Altklausuren', value: '[Hier](' + links.lenOneDriveAK + ') sind ein paar Altklausuren auf Ondrive <:od:776371361185792030> \n[Hier](' + links.lenIliasAK + ') sind die Altklausuren im Ilias <:ilias:776366543093235712>'},
            { name: '\u200B', value: '\u200B' },
            { name: 'Dozent', value: 'Olaf Dössel', inline: true },
            { name: 'Assistent', value: 'Alp Cehri', inline: true },
            { name: 'Übungsleiter', value: 'Jochen Brenneisen', inline: true }
    )
    
    const dTInfo = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Info Seite der Digitaltechnik')
		.setAuthor('Digitaltechnik Informationen', Avatar)
		.setThumbnail('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/floppy-disk_1f4be.png')
        .addFields(
            { name: 'Die Vorlesung findet auf Zoom statt', value: 'Hier ist der [Link](' + links.dtZoom + ') <:zoom:776402157334822964>' },
            { name: 'Ilias', value: 'Hier ist der Link zum [Ilias](' + links.dtIlias + ') von Digitaltechnik <:ilias:776366543093235712>' },
            { name: 'Altklausuren', value: '[Hier](' + links.dtOneDriveAK + ') sind ein paar Altklausuren auf Ondrive <:od:776371361185792030> \n[Hier](' + links.dtIliasAK + ') sind die Altklausuren im Ilias <:ilias:776366543093235712>'},
            { name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Jürgen Becker', inline: true },
			{ name: 'Assistent', value: 'Fabian Kempf', inline: true },
    )
    
}