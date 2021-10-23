import { Client, Collection, Intents, MessageEmbed, TextChannel } from "discord.js"
import * as fs from "fs"
import config from "./private/config.json"

export class DiscordClient extends Client {
	public commands
	public config
	public applications: {
		youtube: string
		poker: string
		betrayal: string
		fishing: string
		chessdev: string
		chess: string
		zombsroyale: string
	}
	/**
	 *  example debug({ foo })
	 * @param args parse with curly brackets to log name and value of variable
	 */
	public debug(args): void {
		let channel = client.channels.cache.find(
			(channel) => channel.id == config.ids.channelIDs.dev.botTestLobby
		) as TextChannel
		channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle(`Debug-Variable: \`${Object.keys(args)[0]}\``)
					.setDescription(JSON.stringify(args[Object.keys(args)[0]]))
			]
		})
	}
}

let client: DiscordClient = new DiscordClient({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_INVITES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.DIRECT_MESSAGES
	],
	partials: ["MESSAGE", "CHANNEL", "REACTION"]
})

client.commands = new Collection()
client.config = config

client.on("ready", async () => {
	await loadScripts(client)
	await loadSlashCommands(client)
	console.log("Online!")
})

client.login(config.botToken)

fs.readdir("./commands/", (err, elements) => {
	var path = "./commands/"
	if (err) return console.log(err)
	elements.forEach((file) => {
		//loop through all elements in folder "commands"
		const element_in_folder = fs.statSync(`./commands/${file}`)
		if (element_in_folder.isDirectory() == true) {
			//check if element in folder is a subfolder
			const sub_directory = `./commands/${file}/`
			fs.readdir(sub_directory, (err, files) => {
				if (err) return console.log(err)
				files.forEach((file) => {
					setCommands(sub_directory, file, client) //adds commands from subfolder to collection
				})
			})
			return
		}

		setCommands(path, file, client) //adds commands from parentfolder to collection
	})
})

function setCommands(path: string, file: string, client: DiscordClient) {
	if (!(file.endsWith(".js") || file.endsWith(".ts"))) return
	let props = require(`${path}${file}`)
	console.log("Successfully loaded command " + file)
	let commandName = file.split(".")[0]
	client.commands.set(commandName, props)
}

fs.readdir("./events/", (err, files) => {
	if (err) console.log(err)
	files.forEach((file) => {
		let eventFunc = require(`./events/${file}`)
		console.log("Successfully loaded event " + file)
		let eventName = file.split(".")[0]
		client.on(eventName, (...args) => eventFunc.run(client, ...args))
	})
})

async function loadScripts(client: DiscordClient) {
	let files
	try {
		files = await fs.promises.readdir("./scripts/")
	} catch (e) {
		console.log(e)
	}
	files.forEach((file) => {
		let script = require(`./scripts/${file}`)
		try {
			script.run(client)
		} catch (e) {
			console.log(e)
		}
		console.log("Successfully executed startupScript " + file)
	})
}

async function loadSlashCommands(client: DiscordClient) {
	let files
	try {
		files = await fs.promises.readdir("./slashCommands/")
	} catch (e) {
		console.log(e)
	}
	files.forEach((file) => {
		let slashCommand = require(`./slashCommands/${file}`)
		try {
			slashCommand.run(client)
		} catch (e) {
			console.log(e)
		}
		console.log("Successfully posted slashCommand " + file)
	})
}
