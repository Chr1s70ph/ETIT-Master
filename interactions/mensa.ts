const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const fs = require("fs");
const https = require("https");
const id = require("../private/id.js");
const loginData = require("../private/loginData.js");
const mdHelper = require("../helper/md.js");
const sendErrorMessageHelper = require("../helper/sendErrorMessage.js");
const { settings } = require("../ETIT-Chef.js");
const timestampHelper = require("../helper/timestamp.js");
const url = require("../private/url.js");

exports.name = "mensa";

exports.description = "Dieser Befehl zeigt den Speiseplan einer Mensa an.";

exports.usage = `${settings.prefix}mensa {MENSA} {TAG}`;

exports.group = "info";

exports.isSlashCommand = true;

exports.permissionLevel = 0;

exports.userPermissionBypass = [];

exports.slash_data = {
	name: "mensa",
	description: "Dieser Befehl zeigt den Speiseplan einer Mensa an.",
	options: [
		{
			name: "wochentag",
			description: "Der Wochentag, der angezeigt werden soll.",
			type: 3,
			required: false,
			choices: [
				{
					"name": "Montag",
					"value": "mo"
				}, {
					"name": "Dienstag",
					"value": "di"
				}, {
					"name": "Mittwoch",
					"value": "mi"
				}, {
					"name": "Donnerstag",
					"value": "do"
				}, {
					"name": "Freitag",
					"value": "fr"
				}
			]
		},
		{
			name: "mensa",
			description: "Die Mensa, die angezeigt werden soll.",
			type: 3,
			required: false,
			choices: [
				{
					"name": "Am Adenauerring",
					"value": "adenauerring"
				}, {
					"name": "Erzbergstraße",
					"value": "erzberger"
				}, {
					"name": "Schloss Gottesaue",
					"value": "gottesaue"
				}, {
					"name": "Tiefbronner Straße",
					"value": "tiefenbronner"
				}, {
					"name": "Caféteria Moltkestraße 30",
					"value": "x1moltkestrasse"
				}
			]
		}
	]
};

class FoodLine {
	constructor(pName, pValue) {
		this.name = pName;
		this.value = pValue;
	}
}

class Weekday {
	constructor(pName, pIndex){
		this.name = pName;
		this.index = pIndex;
	}
}

const mensaOptions = {
	"adenauerring": {
		"name": "Am Adenauerring",
		"foodLines": [
			new FoodLine("l1", "Linie 1"),
			new FoodLine("l2", "Linie 2"),
			new FoodLine("l3", "Linie 3"),
			new FoodLine("l45", "Linie 4"),
			new FoodLine("l5", "Linie 5"),
			new FoodLine("schnitzelbar", "Schnitzelbar"),
			new FoodLine("aktion", "[Kœri]werk 11-14 Uhr"),
			new FoodLine("pizza", "[pizza]werk")
		]
	},
	"erzberger": {
		"name": "Erzbergstraße",
		"foodLines": [
			new FoodLine("wahl1", "Wahlessen 1"),
			new FoodLine("wahl2", "Wahlessen 2"),
			new FoodLine("wahl3", "Wahlessen 3")
		]
	},
	"gottesaue": {
		"name": "Schloss Gottesaue",
		"foodLines": [
			new FoodLine("wahl1", "Wahlessen 1"),
			new FoodLine("wahl2", "Wahlessen 2"),
		]
	},
	"tiefenbronner": {
		"name": "Tiefbronner Straße",
		"foodLines": [
			new FoodLine("wahl1", "Wahlessen 1"),
			new FoodLine("wahl2", "Wahlessen 2"),
			new FoodLine("gut", "Gut & Günstig"),
			new FoodLine("buffet", "Buffet"),
			new FoodLine("curryqueen", "[Kœri]werk")
		]
	},
	"holzgarten": {
		"name": "Holzgartenstraße",
		"foodLines": [
			new FoodLine("gut", "Gut & Günstig 1"),
			new FoodLine("gut2", "Gut & Günstig 2"),
		]
	},
	"x1moltkestrasse": {
		"name": "Caféteria Moltkestraße 30",
		"foodLines": [
			new FoodLine("gut", "Gut & Günstig"),
		]
	}
}

const weekdayOptions = {
	"mo": new Weekday("Montag", 	0),
	"di": new Weekday("Dienstag", 	1),
	"mi": new Weekday("Mittwoch", 	2),
	"do": new Weekday("Donnerstag",	3),
	"fr": new Weekday("Freitag", 	4),
	"sa": new Weekday("Samstag", 	5),
	"so": new Weekday("Sonntag", 	6)
};

async function _updateJson(pClient, pMessage) {
	let channel = (pMessage) ? pMessage.channel : pClient.channels.cache.get(id.channelId.BOT_TEST_LOBBY);

	let options = {
		host: url.MENSA.API_HOST,
		port: 443,
		path: url.MENSA.API_PATH,
		headers: {
		  "Authorization": "Basic " + new Buffer.from(loginData.MENSA.USER + ":" + loginData.MENSA.PWD).toString("base64")
		}
	};

	await https.get(options, function(res) {
		let body = "";
		res.on("data", function(data) {
			body += data;
		});
		res.on("end", function() {
			fs.writeFile(settings.path + "private/cache/mensa.txt", body, { flag: "w+" }, err => {
				if (err) {
					sendErrorMessageHelper.sendErrorMessageToChannel(
						pClient,
						channel,
						`Error: \`_updateJson()\`: Datei konnte nicht gespeichert werden.`,
						`${mdHelper.withStyle("js", err)}`
					);
					return false;
				}
			});
		})
		res.on("error", function(e) {
			sendErrorMessageHelper.sendErrorMessageToChannel(
				pClient,
				channel,
				`Error: \`_updateJson()\`: Fehler beim API-Aufruf.`,
				`${mdHelper.withStyle("js", e.message)}`
			);
			return false;
		});
	});
	return true;
}

async function _loadJSON(){
	let data = await fs.promises.readFile(settings.path + "private/cache/mensa.txt");
	return JSON.parse(data);
}

async function mensa(pClient, pMessage, pRequestedWeekday, pRequestedMensa) {
	const embed = embedHelper.constructDefaultEmbed(pClient)
		.setColor("#FAD51B")
		.setAuthor("🍽️ Mensaplan");

	let jsonData = await _loadJSON();

	let requestedWeekdayIndex = null;
	let requestedDifference = null;

	let currentWeekday = (new Date().getDay()) - 1;

	if (!pRequestedWeekday) {
		if (currentWeekday > 4){
			pRequestedWeekday = "mo";
			requestedWeekdayIndex = 0;
			requestedDifference = 0;
		} else {
			let modifyDate = (new Date().getHours() >= 15) ? 1 : 0;
			for ( let weekday in weekdayOptions) {
				if (weekdayOptions[weekday].index == (currentWeekday + modifyDate)){
					pRequestedWeekday = weekday;
					requestedWeekdayIndex = (currentWeekday + modifyDate);
					requestedDifference = modifyDate;
				}
			}
		}
	} else {
		requestedWeekdayIndex = weekdayOptions[pRequestedWeekday].index;
		if ((requestedWeekdayIndex - currentWeekday) <= 0) {
			requestedDifference = Object.keys(weekdayOptions).length - currentWeekday + requestedWeekdayIndex;
		} else {
			requestedDifference = requestedWeekdayIndex - currentWeekday;
		}
	}

    currentDate = Math.round(Date.now() / 1000); // Take away the milliseconds
	lastDate = Object.keys(jsonData["adenauerring"])[Object.keys(jsonData["adenauerring"]).length - 1];

	if ((currentDate + (7 * 86400)) > lastDate) { // 7 * 86400 : number of seconds in one week
		embed.setDescription(":fork_knife_plate: Aktualisiere JSON...");

		pMessage.channel.send({
			embeds: [ embed ],
		});

		if (!(await _updateJson(pClient, pMessage))){
			return;
		}

		jsonData = await _loadJSON();
	}

	if (Object.keys(jsonData).indexOf(pRequestedMensa) == -1) {
		embed.setTitle("Mensa " + mensaOptions[pRequestedMensa]["name"])
			.setDescription("Diese Mensa hat am angeforderten Tag leider geschlossen.");

		pMessage.channel.send({
			embeds: [ embed ],
		});

		return;
	}

	for ( let timestampKey in Object.keys(jsonData[pRequestedMensa]) ) {
		let timestamp = Object.keys(jsonData[pRequestedMensa])[timestampKey];

        if (timestamp > (currentDate - 86400 + (86400 * requestedDifference))){ // # 86400 number of seconds in one day

			let date = new Date(timestamp * 1000)
			date.setDate(date.getDate() + 1)

			embed.setTitle("Mensa " + mensaOptions[pRequestedMensa]["name"])
				.setDescription(`${date.toLocaleDateString("de-DE", {weekday: "long", year: "numeric", month: "numeric", day: "numeric"})}`);

			for ( let foodLineIndex in mensaOptions[pRequestedMensa]["foodLines"] ) {
				let foodLine = mensaOptions[pRequestedMensa]["foodLines"][foodLineIndex].name;
                let mealValues = "";

				for (let foodLineDataIndex in jsonData[pRequestedMensa][timestamp][foodLine]) {
					let foodLineData = jsonData[pRequestedMensa][timestamp][foodLine][foodLineDataIndex];

                    if (foodLineData["nodata"]){
                        mealValues = "__Leider gibt es für diesen Tag hier keine Informationen!__";
                        break;
					}

                    if (foodLineData["closing_start"]){
                        mealValues = `__Leider ist hier heute geschlossen. Grund: ${foodLineData["closing_text"]}__`;
                        break;
					}

                    let price = ` (${(foodLineData["price_1"] == 0) ? "0.00" : foodLineData["price_1"].toFixed(2)}€)`;
                    let meal = `__${foodLineData["meal"]} ${price}__\n`;
                    let dish = foodLineData["dish"]

                    mealValues += ([ "", "." ].indexOf(dish) == -1) ? `${meal}${dish}\n` : meal;

                    let allAdditions = foodLineData["add"].join(", ");

                    mealValues += (allAdditions != "") ? `_Zusatz: [${allAdditions}]_` : "_Keine Zusätze_";

                    const foodContainsStringToEmoji = {
                        "bio": ":earth_africa:",
                        "fish": ":fish:",
                        "pork": ":pig2:",
                        "pork_aw": ":pig:",
                        "cow": ":cow2:",
                        "cow_aw": ":cow:",
                        "vegan": ":broccoli:",
                        "veg": ":salad:",
                        "mensa_vit": "Mensa Vital"
                    }

					for ([foodContainsKey, foodContainsVal] of Object.entries(foodContainsStringToEmoji)) {
                        if (foodLineData[foodContainsKey]) {
                            mealValues += " " + foodContainsVal;
						}
					}

                    mealValues += "\n\n";
				}

				if (mealValues) {
					embed.addFields({name: `⠀\n:arrow_forward: ${mensaOptions[pRequestedMensa]["foodLines"][foodLineIndex].value} :arrow_backward:`, value: mealValues + "\n", inline: true});
				}
			}
            break;
		}
	}

	embed.addFields({name: "⠀", value: `Eine Liste aller Zusätze findest du [hier](${url.MENSA.ADD_URL_NO_DOWNLOAD}).`, inline: false});

	return embed;
}

async function daily_mensa(pClient) {
	let msg = new Discord.Message(
		pClient,
		{
			channel_id: id.channelId.MENSA,
			guild_id: id.serverId.ETIT_KIT,
			id: "123456789101112",
			content: `${settings.prefix}mensa`,
			author: { id: pClient.user.id },
			channel: pClient.channels.cache.get(id.channelId.MENSA)
		}
	);

	mensa_switcher(pClient, msg);
	setInterval(function() {
		mensa_switcher(pClient, msg);
	}, 86400000); // 86400000 milliseconds are in a day
}

async function mensa_switcher(pClient, pMessageOrInteraction) {
	let msg = null;

	if (pMessageOrInteraction instanceof Discord.Message) {
		let requestedWeekday = null;
		let requestedMensa = "adenauerring";
		let params = pMessageOrInteraction.content.split(" ").map(elem => elem.toLowerCase());

		for ( let weekday in weekdayOptions) {
			if (params.indexOf(weekday) != -1) {
				requestedWeekday = weekday;
				requestedWeekdayIndex = weekdayOptions[weekday].index;
				if (requestedWeekdayIndex > weekdayOptions["fr"].index) {
					sendErrorMessageHelper.sendErrorMessage(
						pClient,
						pMessageOrInteraction,
						`Error: Ungültiger Wert für {TAG}`,
						`Der Mensaplan kann nur für Werktage angezeigt werden.`
					);
					return;
				}
			}
		}

		for ( let mensaKey in mensaOptions ) {
			if (params.indexOf(mensaKey) != -1){
				requestedMensa = mensaKey;
			}
		}

		let embed = await mensa(pClient, pMessageOrInteraction, requestedWeekday, requestedMensa);

		msg = await pMessageOrInteraction.channel.send({
			embeds: [ embed ],
		});
	} else {
		let requestedWeekday = null;
		let requestedMensa = "adenauerring";
		switch(pMessageOrInteraction.options._hoistedOptions.length) {
			case 1:
				if (pMessageOrInteraction.options.data[0].name == "wochentag") {
					requestedWeekday = pMessageOrInteraction.options.data[0].value;
				} else {
					requestedMensa = pMessageOrInteraction.options.data[0].value;
				}
				break;
			case 2:
				if (pMessageOrInteraction.options.data[0].name == "wochentag") {
					requestedWeekday = pMessageOrInteraction.options.data[0].value;
					requestedMensa = pMessageOrInteraction.options.data[1].value;
				} else {
					requestedMensa = pMessageOrInteraction.options.data[1].value;
					requestedMensa = pMessageOrInteraction.options.data[0].value;
				}
				break;
		}

		let embed = await mensa(pClient, pMessageOrInteraction, requestedWeekday, requestedMensa);

		msg = await pMessageOrInteraction.reply({
			embeds: [ embed ],
			ephemeral: true
		});
	}

	if (msg.channel.type == "GUILD_NEWS") {
		console.log("news");
		await msg.crosspost();
	}
}

module.exports.run = mensa_switcher;
module.exports.slash = mensa_switcher;
module.exports.daily_mensa = daily_mensa;