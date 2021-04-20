const config = require('../privateData/config.json');
const discord = require('../node_modules/discord.js');
const links = config.links;
var switchEmbed;

exports.info = info;

async function info(client) {
    var hm2 = "Höhere Mathematik II";
    var es = "Elektronische Schaltungen";
    var emf = "Elektromagnetische Felder";
    var kai = "Komplexe Analysis und Integraltransformationen";
    var it = "Informationstechnik 1";


    await client.api.applications(client.user.id).guilds(config.ids.serverID).commands.post({
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
                            name: hm2,
                            value: hm2
                        },
                        {                    
                            name: es,
                            value: es
                        },
                        {                    
                            name: emf,
                            value: emf
                        },
                        {                    
                            name: kai,
                            value: kai
                        },
                        {                    
                            name: it,
                            value: it
                        },
                        
                    ]
                }
            ]
        }
    });   


    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        if (command === 'info') {
            var iliasLink = "";
            var zoomLink = "";
            var ilias = links.ilias;
            var zoom = links.zoom;


            if (findCommonElement(interaction.member.roles, acceptedRoles)) {
                var course = args[0].value;
                iliasLink = ilias[course];
                zoomLink = zoom[course];
            }

            await client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4, //https://discord.com/developers/docs/interactions/slash-commands#interaction-response-interactionresponsetype
                    data: {
                        content: '<@' + interaction.member.user.id + '>\n',
                        embeds: [
                            switchEmbed(interaction.member.roles, interaction.data.options[0].value, iliasLink, zoomLink, client)
                        ]
                    }
                }
            });

        }
    });

}

function findCommonElement(array1, array2) {
    return array1.some(element => array2.includes(element)) 
}

const role = config.ids.roleIDs;
const acceptedRoles = [
    role.ETIT, //ETIT Bachelorstudent
    role.Moderator, //Moderator
    role.Fachschaft_ETEC //Fachschaft ETEC       
]

function switchEmbed(roles, subjectName, iliasLink, zoomLink, client) {
    var avatar = client.guilds.resolve(config.ids.serverID).members.resolve(config.ids.userID.botUserID).user.avatarURL(); //get Avatar URL of Bot
    
    const embed = new discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(subjectName, avatar)
        .setThumbnail('https://images.emojiterra.com/twitter/v13.0/512px/1f4c8.png')
        
        
    var title = `🛡️ FEHLENDE RECHTE`;
    var fields = [
        { name: '⚠️Du hast nicht die benötigten Rechte, um diesen Befehl auszuführen⚠️', value: `\u200B` },
        { name: '\u200B', value: '\u200B' }
    ];
    
    
    if (findCommonElement(roles, acceptedRoles)) {
        title = `ℹ️ Info Seite von ${subjectName}`;
        fields = [
            { name: 'Ilias', value: `<:ilias:776366543093235712> Hier ist der Link zum [Ilias](${iliasLink})` },
            { name: 'Zoom', value: `<:zoom:776402157334822964> Hier ist der Link zur [Zoom](${zoomLink}) Vorlesung` },
            { name: '\u200B', value: '\u200B' }
        ];

    }

    embed.setTitle(title);
    embed.addFields(fields);
    return embed.setTimestamp();
}