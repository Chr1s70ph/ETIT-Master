var discord = require('discord.js');
var fs = require('fs');
const config = require('../privateData/config.json');

exports.run = async (client) => {
	let commands = [];
	files = await fs.promises.readdir('./commands');
	files.forEach(file => {
		const element_in_folder = fs.statSync(`./commands/${file}`);
		if (element_in_folder.isDirectory() == true) { //check if element is a folder
			const sub_directory = `./commands/${file}/`;
			fs.readdir(sub_directory, (err, elements) => { //reads all subcommands
				if (err) return console.log(err);
				elements.forEach(element => {
					commands[commands.length] = element; //add command to commands array
				})
			});

			return;
		} else {
			commands[commands.length] = file; //add command to commands array
		}
	})

	var slashCount = await fs.promises.readdir('./slashCommands', (err, files) => {
		return files;
	});

	const loginMessage = new discord.MessageEmbed() //Login Embed
		.setColor('#ffa500')
		.setAuthor(client.user.tag, 'https://www.iconsdb.com/icons/preview/orange/code-xxl.png')
		.setThumbnail(client.guilds.resolve(config.ids.serverID).members.resolve(config.ids.userID.botUserID).user.avatarURL())
		.setTitle('[🌐] Bot erfolgreich gestartet')
		.addFields({
			name: 'OS:',
			value: 'Ubuntu 20.04.1 LTS',
			inline: true
		}, {
			name: 'Prozessor:',
			value: 'Intel Xeon X3480 (8) @ 3.068GHz',
			inline: true
		}, {
			name: '⠀',
			value: '⠀',
			inline: true
		})
		.addFields({
			name: 'Befehle geladen:',
			value: commands.length,
			inline: true
		}, {
			name: 'SlashCommands geladen:',
			value: slashCount.length,
			inline: true
		}, {
			name: 'Scheduler:',
			value: 'geladen',
			inline: true
		})
		.setTimestamp()
		.setFooter(`[ID] ${config.ids.userID.botUserID} \nstarted`, 'https://image.flaticon.com/icons/png/512/888/888879.png');

	client.channels.cache.get('770276625040146463').send(loginMessage); //sends login embed to channel
}