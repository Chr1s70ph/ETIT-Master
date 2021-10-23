import { GuildMember } from "discord.js/typings/index.js"
import { DiscordClient } from "../index"
import { TextChannel, MessageEmbed } from "discord.js"

exports.run = async (
	client: DiscordClient,
	oldMember: GuildMember,
	newMember: GuildMember
) => {
	let txtChannel = client.channels.cache.get("852530207336169523") as TextChannel //my own text channel, you may want to specify your own
	let oldRoleIDs = []
	oldMember.roles.cache.each((role) => {
		oldRoleIDs.push(role.id)
	})
	let newRoleIDs = []
	newMember.roles.cache.each((role) => {
		newRoleIDs.push(role.id)
	})
	//check if the newRoleIDs had one more role, which means it added a new role
	if (newRoleIDs.length > oldRoleIDs.length) {
		function filterOutOld(id) {
			for (var i = 0; i < oldRoleIDs.length; i++) {
				if (id === oldRoleIDs[i]) {
					return false
				}
			}
			return true
		}
		let onlyRole = newRoleIDs.filter(filterOutOld)

		let IDNum = onlyRole[0]
		let memberCourseOfStudies = newMember.roles.cache.has(
			client.config.ids.roleIDs["ETIT Bachelorstudent"]
		)
			? "ETIT Bachelorstudent"
			: newMember.roles.cache.has(client.config.ids.roleIDs["MIT Bachelorstudent"])
			? "MIT Bachelorstudent"
			: undefined

		//get right classification channel based on role
		let memberClassificationchannel = newMember.roles.cache.has(
			client.config.ids.roleIDs["ETIT Bachelorstudent"]
		)
			? client.config.ids.channelIDs.ETITPersonalization
			: newMember.roles.cache.has(client.config.ids.roleIDs["MIT Bachelorstudent"])
			? client.config.ids.channelIDs.MITPersonalization
			: undefined
		//get link to message in memberClassificationchannel
		let memberClassificationLink = newMember.roles.cache.has(
			client.config.ids.roleIDs["ETIT Bachelorstudent"]
		)
			? client.config.ids.einteilung.ETITersti
			: newMember.roles.cache.has(client.config.ids.roleIDs["MIT Bachelorstudent"])
			? client.config.ids.einteilung.MITersti
			: undefined

		if (IDNum == client.config.ids.roleIDs.Ophase && memberCourseOfStudies != undefined) {
			const ophaseInfo = new MessageEmbed()
				.setTitle(`🗲 Personalisierung 🗲`)
				.setColor("#FFDA00")
				.setAuthor(client.user.tag, newMember.guild.iconURL())
				.setThumbnail(client.user.avatarURL())
				.setDescription(
					`Meine Spione haben mir erzählt, dass du \`${memberCourseOfStudies}\` bist.
					In [<#${memberClassificationchannel}>](${memberClassificationLink}) kannst du dich weiter einteilen, und die Fächer für dein Semester auswählen.`
				)

			try {
				newMember.send({ embeds: [ophaseInfo] })
				console.log(`Sent ${newMember.user.username} personalization message`)
			} catch (error) {
				throw new Error(error)
			}
		}
	}
}
