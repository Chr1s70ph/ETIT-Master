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
            console.log(interaction.data.options);
            var iliasLink = "";
            var zoomLink = "";
            var ilias = links.ilias;
            var zoom = links.zoom;

            if (findCommonElement(interaction.member.roles, acceptedRoles)) {
                
                switch (args[0].value) {
                    case hm2:
                        iliasLink = ilias.hm2;
                        zoomLink = zoom.hm2;
                        break;
                    case es:
                        iliasLink = ilias.es;
                        zoomLink = zoom.es;
                        break;
                    case emf:
                        iliasLink = ilias.emf;
                        zoomLink = zoom.emf;
                        break;
                    case kai:
                        iliasLink = ilias.kai;
                        zoomLink = zoom.kai;
                        break;
                    case it:
                        iliasLink = ilias.it;
                        zoomLink = zoom.it;
                        break;
                }



            }
            await client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
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
    
    // Loop for array1
    for(let i = 0; i < array1.length; i++) {
        
        // Loop for array2
        for(let j = 0; j < array2.length; j++) {
            
            // Compare the element of each and
            // every element from both of the
            // arrays
            if(array1[i] === array2[j]) {
            
                // Return if common element found
                return true;
            }
        }
    }
    
    // Return if no common element exist
    return false; 
}

const role = config.ids.roleIDs;
const acceptedRoles = [
    role.ETIT, //ETIT Bachelorstudent
    role.Moderator, //Moderator
    role.Fachschaft_ETEC //Fachschaft ETEC       
]

function switchEmbed(roles, subjectName, iliasLink, zoomLink, client) {
    var Avatar = client.guilds.resolve(config.ids.serverID).members.resolve(config.ids.userID.botUserID).user.avatarURL(); //get Avatar URL of Bot
    
    const embed = new discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(subjectName, Avatar)
        .setThumbnail('https://images.emojiterra.com/twitter/v13.0/512px/1f4c8.png')
        
        
        
    if (findCommonElement(roles, acceptedRoles)) {            
            embed.setTitle(`ℹ️Info Seite von ${subjectName}`)
            embed.addFields(
                { name: 'Ilias', value: `Hier ist der Link zum [Ilias](${iliasLink})  <:ilias:776366543093235712>` },
                { name: 'Zoom', value: `Hier ist der Link zur [Zoom](${zoomLink}) Vorlesung <:ilias:776366543093235712>` },
                { name: '\u200B', value: '\u200B' },
                )
    } else {
        embed.setTitle(`🛡️FEHLENDE RECHTE`)
        embed.addFields(
            { name: '⚠️Du hast nicht die benötigten Rechte, um diesen Befehl auszuführen⚠️', value: `\u200B` },
            { name: '\u200B', value: '\u200B' },
    )

    }
    return embed.setTimestamp();
}