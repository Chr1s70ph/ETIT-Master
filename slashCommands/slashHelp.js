exports.run = async (client) => {

    await client.api.applications(client.user.id).commands.post({
        data: {
            name: "help",
            description: "Hilfe ist hier"
        }
    });

    client.ws.on('INTERACTION_CREATE', async interaction => {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;

        if (command === 'help') {
            await client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4, //https://discord.com/developers/docs/interactions/slash-commands#interaction-response-interactionresponsetype
                    data: {
                        content: "```asciidoc\n = Die Hauptfunktion des Bots ist es, an Vorlesungen und in Zukunft auch an Tutorien zu erinnern =\n----------" +
                            "\nVorlesungserinnerung :: Der Bot schickt automatisch in den Channel des jeweiligen Faches 5 Minuten vor Vorlesungsbeginn einen Link zum jeweiligen Zoom-Meeting (oder zur YouTube Playlist bei Experimental Physik.\n```",

                        flags: 64
                    }
                }
            });
            client.api.webhooks(client.user.id, interaction.token).post({
                data: {
                    content: "```asciidoc\n = Das ist die Hilfeseite der Befehle! =\nHier werden alle Befehle aufgelistet\n----------" +
                        "\nping :: gibt die Ping werte zum Bot und zur API aus\n```",
                    flags: 64
                }
            })
        }
    });
}