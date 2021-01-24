var config = require("../startupScripts/loadConfig.js")
const prefix = ".";

exports.run = async (client, message) => {
	if (message.author.bot) return;
	if (message.content.startsWith(prefix)) {
		let messageArray = message.content.split(" "),
			cmd = messageArray[0],
			args = messageArray.slice(1),
			commandfile = client.commands.get(cmd.slice(prefix.length)) || client.aliases.get(cmd.slice(prefix.length));
			
		if (commandfile == ' ') return;
		try {
			commandfile.run(client, message, args);
		}
		catch (error) {
			console.error(error);
		}
		
		//if (getWartungsarbeiten == 'exports.Wartungsarbeiten = Wartungsarbeiten = false;') {
		//	if (commandfile == ' ') return;
		//	else if (!commandfile) {
		//		message.channel.send("Ich kenne diesen Befehl nicht. \nTippe '-help' für mehr Informationen.");
		//		return;
		//	}
		//	commandfile.run(client, message, args);
		//} else if (getWartungsarbeiten == 'exports.Wartungsarbeiten = Wartungsarbeiten = true;') {
		//	if (message.author == '192701441188560900') {
		//		if (commandfile == ' ') return;
		//		else if (!commandfile) {
		//			message.channel.send("You stupid idiot!");
		//			return;
		//		}
		//		commandfile.run(client, message, args);
		//	} else if (!message.author == '192701441188560900') message.channel.send("`Error404: userID unknown!`") 
		//} else console.log('error');
	}
}

// var getWartungsarbeiten = fs.readFile('./startupScripts/loadConfig.js', 'utf8', (err, data) => {
// 	if (err) {
// 		console.log(err);
// 		return
// 	}
// })