const config = require('../privateData/config.json')
var prefix = config.prefix;


exports.run = async (client, message) => {
	if (message.author.bot) return;
	if (message.content.startsWith(prefix)) {
		let messageArray = message.content.split(" "),
			commandName = messageArray[0],
			args = messageArray.slice(1);
			commandName = commandName.slice(prefix.length);
			// commandfile = client.commands.get(cmd.slice(prefix.length)) || client.aliases.get(cmd.slice(prefix.length));

			commandfile = client.commands.get(commandName)
			|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		
		if (commandfile == undefined) return;
		try {
			message.delete();
			commandfile.run(client, message, args);
			console.log(`${message.author.username} used ${commandName} with arguments: ${args}`)
		} catch (error) {
			console.error(error);
		}
	}
}