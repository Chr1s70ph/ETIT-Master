const config = require("./private/config.json")
const discord = require("./node_modules/discord.js")
const client = new discord.Client({
	intents: [
		discord.Intents.FLAGS.GUILDS,
		discord.Intents.FLAGS.GUILD_MEMBERS,
		discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		discord.Intents.FLAGS.GUILD_PRESENCES,
		discord.Intents.FLAGS.GUILD_MESSAGES
	]
})
const fs = require("fs")

client.commands = new discord.Collection()

client.on("ready", () => {
	foo(client)
})

async function foo(client) {
	await loadScripts(client)
	await loadSlashCommands(client)
	console.log("Online!")
}

client.login(config.botToken)

//Commands "handler"
/**
 *
 */
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

/**
 * Adds all commands to the commands collection
 * @param {string} path relative path to the file of each command
 * @param {string} file actual filename of the file
 * @param {Object} client
 */
function setCommands(path, file, client) {
	if (!file.endsWith(".js")) return
	let props = require(`${path}${file}`)
	console.log("Successfully loaded command " + file)
	let commandName = file.split(".")[0]
	client.commands.set(commandName, props)
}

//Events "handler"
/**
 *  loads all events and adds them to the event collection
 */
fs.readdir("./events/", (err, files) => {
	if (err) console.log(err)
	files.forEach((file) => {
		let eventFunc = require(`./events/${file}`)
		console.log("Successfully loaded event " + file)
		let eventName = file.split(".")[0]
		client.on(eventName, (...args) => eventFunc.run(client, ...args))
	})
})

/**
 *
 * @param {object} client necessary to start scripts relying on client
 */
async function loadScripts(client) {
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

async function loadSlashCommands(client) {
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
