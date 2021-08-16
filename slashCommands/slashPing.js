const config = require("../private/config.json")

exports.run = async (client) => {
	await client.api
		.applications(client.user.id)
		.guilds(config.ids.serverID)
		.commands.post({
			data: {
				name: "ping",
				description: "Prüft, ob der Bot ordnungsgemäß antwortet"
			}
		})

	client.ws.on("INTERACTION_CREATE", async (interaction) => {
		if (interaction.type != "2") return //type 2 interactions are slashcommands

		const command = interaction.data.name.toLowerCase()
		const args = interaction.data.options

		if (command === "ping") {
			await client.api.interactions(interaction.id, interaction.token).callback.post({
				data: {
					type: 4,
					data: {
						content: "pong",
						flags: 64
					}
				}
			})
		}
	})
}
