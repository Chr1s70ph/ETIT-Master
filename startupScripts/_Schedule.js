var private = require('../private.js');
var schedule = require('node-schedule');
const discord = require('../node_modules/discord.js');
const serverId = private.serverId;
const botUserID = private.botUserID;
const links = private.links;

exports.WeekPlanReminder = WeekPlanReminder;

function WeekPlanReminder(client) {
	HmSchedule(client);
    ExPhySchedule(client);
    DtSchedule(client);
	LenSchedule(client);
	MatlabSchedule(client);
	TreffenSchedule(client);
}

function HmSchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const hmEmbed = new discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('HM1 Inverted Classroom')
	.setURL(links.hmZoom)
	.setAuthor('Hm1 Reminder', Avatar)
	.setDescription('Der HM1 Inverted Classroom fängt in 5 Minuten an')
	.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
	.addFields(
		{ name: 'Die Vorlesung findet wie gewohnt über Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Dozent', value: 'Ioannis Anapolitanos', inline: true },
		{ name: 'Assistent', value: 'Semjon Wugalter', inline: true },
	)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var HMMon = schedule.scheduleJob('0 55 9 * * 1', function () {
			client.channels.cache.get('773676846411808789').send('<@&770181853558341652>', hmEmbed.setTimestamp())	
			.then(msg => msg.delete({ timeout: 5400000 }))
	});

	const hmuEmbed = new discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('HM1 Fragestunde')
	.setURL(links.hmuZoom)
	.setAuthor('Hm1 Reminder', Avatar)
	.setDescription('Der HM1 Inverted Classroom fängt in 5 Minuten an')
	.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
	.addFields(
		{ name: 'Die Vorlesung findet wie gewohnt über Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Dozent', value: 'Ioannis Anapolitanos', inline: true },
		{ name: 'Assistent', value: 'Semjon Wugalter', inline: true },
	)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var HMThu = schedule.scheduleJob('0 55 15 * * 4', function () {
			client.channels.cache.get('773676846411808789').send('<@&770181853558341652>', hmuEmbed.setTimestamp())
				.then(msg => msg.delete({ timeout: 5400000 }))
    });
}

function ExPhySchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const exPhyEmbed = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Ex-Phy Vorlesung')
		.setURL(links.phyYouTube)
		.setAuthor('Ex-phy Reminder', Avatar)
		.setDescription('Die Ex-Phy Vorlesung fängt in 5 Minuten an')
		.setThumbnail('https://i.pinimg.com/originals/de/1c/91/de1c91788be0d791135736995109272a.png')
		.addFields(
			{ name: 'Die Vorlesung findet wie gewohnt auf Youtube statt.', value: 'Ist die Vorlesung nicht in der Playlist, dann geht bitte auf [Ilias](' + links.phyIlias + ')'},
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Thomas Schimmel', inline: true },
			{ name: 'Assistent', value: 'Schwerkraftaus Schubi', inline: true },
		)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var ExPhyWed = schedule.scheduleJob('0 55 11 * * 3', function () {
			client.channels.cache.get('773677291188256778').send('<@&770181853558341652>', exPhyEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
	var ExPhyFri = schedule.scheduleJob('0 55 11 * * 5', function () {
			client.channels.cache.get('773677291188256778').send('<@&770181853558341652>', exPhyEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
}

function DtSchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const dtEmbed = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('DT Vorlesung')
		.setURL(links.dtZoom)
		.setAuthor('DT Reminder', Avatar)
		.setDescription('Die DT Vorlesung fängt in 5 Minuten an')
		.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
		.addFields(
			{ name: 'Die Vorlesung findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Jürgen Becker', inline: true },
			{ name: 'Assistent', value: 'Fabian Kempf', inline: true },
		)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var DTWed = schedule.scheduleJob('0 55 13 * * 3', function () {	
			client.channels.cache.get('773677632315326504').send('<@&770181853558341652>', dtEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
	var DTFri = schedule.scheduleJob('0 55 7 * * 5', function () {	
			client.channels.cache.get('773677632315326504').send('<@&770181853558341652>', dtEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
}

function LenSchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const lenEmbed = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('LEN Vorlesung')
		.setURL(links.lenZoom)
		.setAuthor('LEN Reminder', Avatar)
		.setDescription('Die LEN Vorlesung fängt in 5 Minuten an')
		.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
		.addFields(
			{ name: 'Die Vorlesung findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Olaf Dössel', inline: true },
			{ name: 'Assistent', value: 'Alp Cehri', inline: true },
			{ name: 'Übungsleiter', value: 'Jochen Brenneisen', inline: true }
		)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var LENTue = schedule.scheduleJob('0 55 9 * * 2', function () {
			client.channels.cache.get('773677559447158845').send('<@&770181853558341652>', lenEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
	var LENThu = schedule.scheduleJob('0 55 9 * * 4', function () {	
			client.channels.cache.get('773677559447158845').send('<@&770181853558341652>', lenEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
	});	
	
	const lenuEmbed = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('LEN Übung')
		.setURL(links.lenuZoom)
		.setAuthor('LEN Reminder', Avatar)
		.setDescription('Die LEN Übung fängt in 5 Minuten an')
		.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
		.addFields(
			{ name: 'Die Übung findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Olaf Dössel', inline: true },
			{ name: 'Assistent', value: 'Alp Cehri', inline: true },
			{ name: 'Übungsleiter', value: 'Jochen Brenneisen', inline: true }
		)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);


	var LENThu = schedule.scheduleJob('0 55 11 * * 4', function () {
			client.channels.cache.get('773677559447158845').send('<@&770181853558341652>', lenuEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
}

function MatlabSchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const matlabEmbed = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Matlab Zoom Konferenz')
		.setURL(links.mlZoom)
		.setAuthor('Matlab Zoom Konferenz', Avatar)
		.setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
		.setDescription('Die Zoom Konferenz fängt in 5 Minuten an')
		.addFields(
			{ name: 'Die Konferenz findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Dozent', value: 'Michael Marz', inline: true },
			{ name: 'Dozent', value: 'Anna Steinig', inline: true }
		)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var MatlabMon = schedule.scheduleJob('0 55 11 * * 1', function () {
			client.channels.cache.get('774009071102984242').send('<@&774008738905718785>', matlabEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
	var MatlabThu = schedule.scheduleJob('0 55 9 * * 3', function () {
			client.channels.cache.get('774009071102984242').send('<@&774008738905718785>', matlabEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
}

function TreffenSchedule(client) {
	var Avatar = client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL(); //get Avatar URL of Bot

	const treffenEmbed = new discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Digitales Treffen')
		.setAuthor('Digitales Treffen', Avatar)
		.setDescription('Das digitale Treffen fängt in 5 Minuten an')
		.addFields(
			{ name: 'Das Treffen findet wie gewohnt statt.', value: 'Ihr könnt aber natürlich jederzeit nach joinen' },
		)
		.setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', Avatar);

	var TreffenMon = schedule.scheduleJob('0 55 18 * * 1', function () {
			client.channels.cache.get('767754885763563520').send('<@&774275407251898398>', treffenEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
	var TreffenThu = schedule.scheduleJob('0 55 18 * * 4', function () {
			client.channels.cache.get('767754885763563520').send('<@&774275407251898398>', treffenEmbed.setTimestamp())
			.then(msg => msg.delete({ timeout: 5400000 }))
    });
}