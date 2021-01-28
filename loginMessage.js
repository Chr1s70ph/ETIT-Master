var discord = require('discord.js');
exports.display = display;
var fs = require('fs');
var private = require('./private.js');
const serverId = private.serverId;
const botUserID = private.botUserID;
var commandCount = fs.readdir('./commands', (err, files) => {
	commandCount = files.length;
});
var slashCount = fs.readdir('./slashCommands', (err, files) => {
	slashCount = files.length;
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
			{ name: 'Prozessor:', value: 'Intel Xeon X3480 (8) @ 3.068GHz', inline: true },
			{ name: '⠀', value:  '⠀', inline: true })
			.addFields(
			{ name: 'Befehle geladen:', value: commandCount, inline: true },
			{ name: 'SlashCommands geladen:', value: slashCount, inline: true},
			{ name: 'Scheduler:', value: 'geladen', inline: true }
			)
		.setTimestamp()
		.setFooter('[ID] '+ botUserID +' \nstarted', 'https://image.flaticon.com/icons/png/512/888/888879.png');
	
	client.channels.cache.get('770276625040146463').send(loginMessage); //sends login embed to channel
}