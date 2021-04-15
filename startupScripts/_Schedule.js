var private = require('../private.js');
var schedule = require('node-schedule');
const discord = require('../node_modules/discord.js');
const serverId = private.serverId;
const botUserID = private.botUserID;
const links = private.links;

exports.WeekPlanReminder = WeekPlanReminder;

function WeekPlanReminder(client) {
	HmSchedule(client);
    eSSchedule(client);
    eMFSchedule(client);
	kaiSchedule(client);
	ITSchedule(client);
	// foo(client);
}




// function foo(client) {
// 	const message = new discord.MessageEmbed()
// 	.setColor('#21b93a')
// 	.setTitle('Debugger gesucht')
// 	.setAuthor('Das Entwickler-Team', 'https://cdn3.iconfinder.com/data/icons/logos-and-brands-adobe/512/84_Dev-512.png')
// 	// .setDescription('Der HM1 Inverted Classroom fängt in 5 Minuten an')
// 	.setThumbnail('https://www.puppet-debugger.com/public/images/puppet-debugger.png')
// 	.addFields(
// 		{ name: 'Wir suchen dich!', value: '∙ Menschen mit Interesse am Programmieren' },
// 		{ name: 'Was wir bieten:', value: '∙ Erfahrung in C++ und anderen Sprachen\n∙ Schnelle Antworten und große Unterstützung\n∙ 100% flexible Arbeitszeiten\n∙ Zugriff auf exklusive Kanäle\n∙ Private Hilfe bei Fragen rund um das Thema Programmieren' },
// 		{ name: 'Warum wir genau **dich** brauchen:', value: '∙ Wir brauchen stets Hilfe beim Bugs finden, um einen möglichst reibungsfreien Ablauf des Servers zu ermöglichen!' },
// 		{ name: 'Besondere Leistungen', value: '∙ Die brandneue und heiß begehrte Rolle <@&818795998302175232>' },
// 		{ name: 'Für besonders aktive Debugger:', value: '∙ Eine Belohnung in Form von Keksen\n(die Menge variiert je nach dem, wie sehr geholfen wird)' },
// 		{ name: 'Was du mitbringen musst:', value: '∙ Eine Leidenschaft am Programmieren\n∙ Nur so viel Zeit wie ihr wollt' },
// 		{ name: '\u200B', value: '\u200B' },
// 	)
// 	.setFooter('\u200B', 'https://cdn3.iconfinder.com/data/icons/logos-and-brands-adobe/512/84_Dev-512.png');

// 	client.channels.cache.get('757981349402378334').send(message.setTimestamp())	
// }

function HmSchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const hmEmbed = new discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('HM2 Vorlesung')
	.setURL(links.hmZoom)
	.setAuthor('Hm2 Reminder', Avatar)
	.setDescription('Die HM2 Vorlesung fängt in 5 Minuten an')
	.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
	.addFields(
		{ name: 'Die Vorlesung findet wie gewohnt über Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Dozent', value: 'Ioannis Anapolitanos', inline: true },
		{ name: 'Assistent', value: 'Semjon Wugalter', inline: true },
	)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var HMMon = schedule.scheduleJob('0 55 9 * * 1', function () {
			client.channels.cache.get('829369570514829352').send('<@&770181853558341652>', hmEmbed.setTimestamp())	
			.then(msg => msg.delete({ timeout: 5400000 }))
	});

	// const hmuEmbed = new discord.MessageEmbed()
	// .setColor('#0099ff')
	// .setTitle('HM1 Fragestunde')
	// .setURL(links.hmuZoom)
	// .setAuthor('Hm1 Reminder', Avatar)
	// .setDescription('Der HM1 Inverted Classroom fängt in 5 Minuten an')
	// .setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
	// .addFields(
	// 	{ name: 'Die Vorlesung findet wie gewohnt über Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
	// 	{ name: '\u200B', value: '\u200B' },
	// 	{ name: 'Dozent', value: 'Ioannis Anapolitanos', inline: true },
	// 	{ name: 'Assistent', value: 'Semjon Wugalter', inline: true },
	// )
	// 	.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	// var HMThu = schedule.scheduleJob('0 55 15 * * 4', function () {
	// 		client.channels.cache.get('773676846411808789').send('<@&770181853558341652>', hmuEmbed.setTimestamp())
	// 			.then(msg => msg.delete({ timeout: 5400000 }))
    // });
}

function eSSchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const esEmbed = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('ES Vorlesung')
		.setURL(links.esZOOM)
		.setAuthor('ES Reminder', Avatar)
		.setDescription('Die ES Vorlesung fängt in 5 Minuten an')
		.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
		.addFields(
			{ name: 'Die Vorlesung findet wie gewohnt über Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
			{ name: 'Falls der obige Link nicht funktioniert, ist vielleicht Übung', value: 'Probier es mal hiermit: [Link](' + links.esZOOMEx + ') zur Übung' },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Ahmet Cagri Ulusoy', inline: true },
			{ name: 'Übungsleiter', value: 'M.Sc. Selina Eckel', inline: true },
			{ name: 'Übungsleiter', value: 'M.Sc. Daniel Gil', inline: true },
			{ name: 'Übungsleiter', value: 'M.Sc. Matthias Möck', inline: true },
		)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var EsMon = schedule.scheduleJob('0 55 11 * * 1', function () {
			client.channels.cache.get('829369864941994024').send('<@&770181853558341652>', esEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
	var EsThu = schedule.scheduleJob('0 55 11 * * 4', function () {
			client.channels.cache.get('829369864941994024').send('<@&770181853558341652>', esEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
}

function eMFSchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const emfEmbed = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('EMF Vorlesung')
		.setURL(links.emfZoom)
		.setAuthor('EMF Reminder', Avatar)
		.setDescription('Die EMF Vorlesung fängt in 5 Minuten an')
		.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
		.addFields(
			{ name: 'Die Vorlesung findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Prof. Dr.-Ing. Martin Doppelbauer', inline: true }
		)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var emfTue = schedule.scheduleJob('0 55 15 * * 2', function () {	
			client.channels.cache.get('829370390245408878').send('<@&770181853558341652>', emfEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
	var emfFri = schedule.scheduleJob('0 55 11 * * 5', function () {	
			client.channels.cache.get('829370390245408878').send('<@&770181853558341652>', emfEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
}

function kaiSchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const kaiEmbed = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('KAI Vorlesung')
		.setURL(links.kaiZoom)
		.setAuthor('KAI Reminder', Avatar)
		.setDescription('Die KAI Vorlesung/Übung fängt in 5 Minuten an')
		.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
		.addFields(
			{ name: 'Die Vorlesung/Übung findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Kluwe', inline: true },
		)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var KAIThu = schedule.scheduleJob('0 55 9 * * 4', function () {	
			client.channels.cache.get('829370640372203520').send('<@&770181853558341652>', kaiEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
	});
	
	// var KAIThu = schedule.scheduleJob('0 55 15 * * 4', function () {	
	// 		client.channels.cache.get('829370640372203520').send('<@&770181853558341652>', kaiEmbed.setTimestamp())
	// 		.then(msg => msg.delete({ timeout: 5400000 }))
	// });	
}

function ITSchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const itEmbed = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('IT Zoom Konferenz')
		.setURL(links.itZoom)
		.setAuthor('IT Zoom Konferenz', Avatar)
		.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
		.setDescription('Die Zoom Konferenz fängt in 5 Minuten an')
		.addFields(
			{ name: 'Die Konferenz findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
			{ name: 'Falls der obige Link nicht funktioniert, ist vielleicht Übung', value: 'Probier es mal hiermit: [Link](' + links.itZoomEx + ') zur Übung' },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Sax', inline: true }
		)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var itThu = schedule.scheduleJob('0 55 13 * * 4', function () {
			client.channels.cache.get('829370694827245589').send('<@&770181853558341652>', itEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
	var itFri = schedule.scheduleJob('0 55 7 * * 5', function () {
			client.channels.cache.get('829370694827245589').send('<@&770181853558341652>', itEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
}

