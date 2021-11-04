import { loadScripts, loadSlashCommands, DiscordClient } from "../index"

exports.run = async (client: DiscordClient) => {
	await loadScripts(client)
	await loadSlashCommands(client)
	console.log("Online!")
}
