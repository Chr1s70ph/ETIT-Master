var discord = require('discord.js');
exports.display = display;
var fs = require('fs');
const dir = './commands';
var private = require('./private.js');
const serverId = private.serverId;
const botUserID = private.botUserID;
var commandCount = fs.readdir(dir, (err, files) => {
	commandCount = files.length;
});


function display(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot
	const loginMessage = new discord.MessageEmbed() //Login Embed
		.setColor('#ffa500')
		.setAuthor(client.user.tag, 'https://www.iconsdb.com/icons/preview/orange/code-xxl.png')
		.setThumbnail(Avatar)
		.setTitle('[🌐] Bot erfolgreich gestartet')
		.addFields(
			{ name: 'OS:', value: 'Ubuntu 20.04.1 LTS', inline: true },
			{ name: 'Prozessor', value: 'Intel Xeon X3480 (8) @ 3.068GHz', inline: true })
		.addFields(
			{ name: 'Befehle geladen:', value: commandCount, inline: false },
			{ name: 'Scheduler:', value: 'geladen', inline: true },
			{ name: 'SlashCommands', value: 'geladen', inline: true}
			)
		.setTimestamp()
		.setFooter('[ID]'+ botUserID +' \n started at:', 'https://image.flaticon.com/icons/png/512/888/888879.png');
	
	client.channels.cache.get('770276625040146463').send(loginMessage); //sends login embed to channel
}