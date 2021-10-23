import { DiscordClient } from "../../index"
import { Message, MessageEmbed } from "discord.js"
/**
 * NOTE:
 * This code is heavily inspired by the discord-together package
 * I did not like how it was implemented, so I rewrote parts of it myself here
 * this is the original package: https://www.npmjs.com/package/discord-together
 */

const defaultApplications = {
	youtube: "755600276941176913", // Note : Thanks to Snowflake thanks to whom I got YouTube ID
	poker: "755827207812677713",
	betrayal: "773336526917861400",
	fishing: "814288819477020702",
	chessdev: "832012586023256104", // Note : First package to offer chessDev, any other package offering it will be clearly inspired by it
	chess: "832012774040141894", // Note : First package to offer chess, any other package offering it will be clearly inspired by it
	zombsroyale: "519338998791929866" // Note : First package to offer ZombsRoyake.Io, any other package offering it will be clearly inspired by it, thanks to https://github.com/LilDerp-IsBetter thanks to whom i got the ZombsRoyale.io ID
}

exports.name = "start"

exports.description = `Trickst die API aus um Discord-Spiele freizuschalten. 
	**NOTIZ**: Nicht alle Spiele sind vollends implementiert`

exports.usage = `start \`${Object.keys(defaultApplications)}\``

exports.run = async (
	client: DiscordClient,
	message: Message,
	args: any,
	applications = defaultApplications
) => {
	//save message, before it magically gets lost (thanks discord API :] )
	var message = message
	//throw an error, when user not in voiceChannel
	if (!message.member.voice.channel) {
		try {
			message.reply({
				embeds: [
					new MessageEmbed().setDescription(
						`⚠️ You are not in a Voice-Channel.
						Please join a Voice-Channel to use this function`
					)
				]
			})
		} catch (e) {
			throw new Error(e)
		}
		throw new Error(`Did not find Voice-Channel of User !`)
	}

	client.applications = { ...defaultApplications, ...applications }
	let returnData = {
		code: "none"
	}
	let option = args[0]
	let voiceChannelId = message.member.voice.channel.id
	if (option && client.applications[option.toLowerCase()]) {
		let applicationID = client.applications[option.toLowerCase()]
		try {
			//send POST to the discordAPI to get an invite with a discord-together application
			await fetch(`https://discord.com/api/v9/channels/${voiceChannelId}/invites`, {
				method: "POST",
				body: JSON.stringify({
					max_age: 86400,
					max_uses: 0,
					target_application_id: applicationID,
					target_type: 2,
					temporary: false,
					validate: null
				}),
				headers: {
					Authorization: `Bot ${client.token}`,
					"Content-Type": "application/json"
				}
			})
				.then((res) => res.json())
				.then((invite) => {
					//error handling
					if (invite.error || !invite.code)
						throw new Error("An error occured while retrieving data !")
					if (invite.code === 50013 || invite.code === "50013")
						throw new Error("Your bot lacks permissions to perform that action")
					if (invite.code === 50035 || invite.code === "50035")
						throw new Error("Error creating the application")
					returnData.code = `https://discord.com/invite/${invite.code}`
				})
		} catch (err) {
			throw new Error(`An error occured while starting ${option} !` + err)
		}
	} else {
		try {
			message.reply({
				embeds: [new MessageEmbed().setDescription(`⚠️ Invalid option!`)]
			})
		} catch (e) {
			throw new Error(e)
		}
		throw new SyntaxError("Invalid option !")
	}
	return message.reply({
		content: returnData.code,
		embeds: [
			new MessageEmbed().setDescription(
				`❔ If you can't join the activity **create it** by clicking the **[link](${returnData.code})** above.`
			)
		]
	})
}
