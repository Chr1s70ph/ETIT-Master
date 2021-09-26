const config = require("../private/config.json")
const discord = require("../node_modules/discord.js")
const links = config.links
var serverID = config.ids.serverID
var moderatorRoles = config.ids.moderatorRoles
var switchEmbed

exports.run = async (client) => {
	//2. semester EE
	var hmII_EE = "Höhere Mathematik II ETIT"
	var es = "Elektronische Schaltungen"
	var emf = "Elektromagnetische Felder"
	var kai = "Komplexe Analysis und Integraltransformationen"
	var itI = "Informationstechnik I"

	//4. semester EE
	var itII = "Informationstechnik II und Automatisierungstechnik"
	var ofe = "Optik und Festkörperelektronik"
	var ght = "Grundlagen der Hochfrequenztechnik"
	var ees = "Elektroenergiesysteme"

	//2.semester MIT
	var tmII = "Technische Mechanik II"
	var mklII = "Maschinenkonstruktionslehre II"
	var hmII_MIT = "Höhere Mathematik II MIT"

	await client.api
		.applications(client.user.id)
		.guilds(config.ids.serverID)
		.commands.post({
			data: {
				name: "info",
				description: "Gibt infos",
				type: 1,
				options: [
					{
						name: "fach",
						description:
							"Über welches Fach möchtest du etwas wissen? Du kannst auch nach deinem Fach suchen!",
						type: 3,
						required: true,
						choices: [
							{
								name: hmII_EE,
								value: hmII_EE
							},
							{
								name: es,
								value: es
							},
							{
								name: emf,
								value: emf
							},
							{
								name: kai,
								value: kai
							},
							{
								name: itI,
								value: itI
							},

							{
								name: itII,
								value: itII
							},
							{
								name: ofe,
								value: ofe
							},
							{
								name: ght,
								value: ght
							},
							{
								name: ees,
								value: ees
							},

							{
								name: tmII,
								value: tmII
							},
							{
								name: mklII,
								value: mklII
							},
							{
								name: hmII_MIT,
								value: hmII_MIT
							}
						]
					}
				]
			}
		})

	client.ws.on("INTERACTION_CREATE", async (interaction) => {
		if (interaction.type != "2") return //type 2 interactions are slashcommands
		const command = interaction.data.name.toLowerCase()
		const args = interaction.data.options
		if (command === "info") {
			var iliasLink = ""
			var zoomLink = ""
			var ilias = links.ilias
			var zoom = links.zoom
			var kitLectureDirectory = links.kitLectureDirectory
			var zoomAdditional = links.zoomAdditional
			var kitDirectoryLink = ""
			var pictures = config.pictures.info

			var course = interaction.data.options[0].value
			iliasLink = ilias[course]
			if (course != hmII_MIT) {
				zoomLink = zoom[course]
				zoomAdditional = zoomAdditional[course]
			} else {
				kitDirectoryLink = kitLectureDirectory[course]
			}

			console.log("User " + interaction.member.user.username + " issued /info " + course)

			var picture = findPicture(course, pictures)

			await client.api.interactions(interaction.id, interaction.token).callback.post({
				data: {
					type: 4, //https://discord.com/developers/docs/interactions/slash-commands#interaction-response-interactionresponsetype
					data: {
						embeds: [
							switchEmbed(
								interaction.member.roles,
								course,
								iliasLink,
								zoomLink,
								zoomAdditional,
								kitDirectoryLink,
								ilias,
								picture,
								client
							)
						],
						flags: 64
					}
				}
			})
		}
	})
}

function findPicture(course, pictures) {
	var picture
	Object.keys(pictures).forEach(function (key) {
		if (course.includes(key)) {
			picture = pictures[key]
		}
	})

	return picture
}

function userHasAccesRights(client, memberRoles, course) {
	var hasRights
	for (entry in memberRoles) {
		//allows moderators to acces all /info entries
		for (role in moderatorRoles) {
			if (moderatorRoles[role] == memberRoles[entry]) {
				return true
			}
		}

		var roleName = client.guilds.resolve(serverID).roles.cache.get(memberRoles[entry]).name
		if (course.toString() === roleName) {
			return true
		}
	}
}

function switchEmbed(
	roles,
	subjectName,
	iliasLink,
	zoomLink,
	zoomAdditional,
	kitDirectoryLink,
	ilias,
	picture,
	client
) {
	var avatar = client.user.avatarURL() //get Avatar URL of Bot

	const embed = new discord.MessageEmbed()
		.setColor("#0099ff")
		.setAuthor(subjectName, avatar)
		.setThumbnail(picture)

	var title = `🛡️ FEHLENDE RECHTE`
	var fields = [
		{
			name: "⚠️Du hast nicht die benötigten Rechte, um diesen Befehl auszuführen⚠️",
			value: `\u200B`
		},
		{
			name: "\u200B",
			value: "\u200B"
		}
	]

	if (userHasAccesRights(client, roles, subjectName) == true) {
		title = `ℹ️ Info Seite von ${subjectName}`
		fields = [
			{
				name: "Ilias",
				value: `<:ilias:776366543093235712> Hier ist der Link zum [Ilias](${iliasLink})`
			}
		]
		if (!kitDirectoryLink) {
			fields[fields.length] = {
				name: "Zoom",
				value: `<:zoom:776402157334822964> Hier ist der Link zur [Zoom](${zoomLink}) Vorlesung`
			}
		} else {
			fields[fields.length] = {
				name: "Vorlesungsverzeichnis",
				value: `<:KIT:776497722203177020> Hier ist der Link zum [KIT Vorlesungsverzeichnis](${kitDirectoryLink})`
			}
		}

		if (links.zoomAdditional[subjectName]) {
			fields[fields.length] = {
				name: "Zoom",
				value: `<:zoom:776402157334822964> Hier ist der Link zur [Zoom](${zoomAdditional}) Übung/Fragestunde`
			}
		}

		fields[fields.length] = {
			name: "\u200B",
			value: "\u200B"
		}
	}

	embed.setTitle(title)
	embed.addFields(fields)
	return embed.setTimestamp()
}
