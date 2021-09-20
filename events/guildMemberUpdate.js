const discord = require("discord.js")
const config = require("../private/config.json")

exports.run = async (client, oldMember, newMember) => {
	let txtChannel = client.channels.cache.get("852530207336169523") //my own text channel, you may want to specify your own
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
			config.ids.roleIDs["ETIT Bachelorstudent"]
		)
			? "ETIT Bachelorstudent"
			: newMember.roles.cache.has(config.ids.roleIDs["MIT Bachelorstudent"])
			? "MIT Bachelorstudent"
			: undefined

		//get right classification channel based on role
		let memberClassificationchannel = newMember.roles.cache.has(
			config.ids.roleIDs["ETIT Bachelorstudent"]
		)
			? config.ids.channelIDs.ETITPersonalization
			: newMember.roles.cache.has(config.ids.roleIDs["MIT Bachelorstudent"])
			? config.ids.channelIDs.MITPersonalization
			: undefined
		//get link to message in memberClassificationchannel
		let memberClassificationLink = newMember.roles.cache.has(
			config.ids.roleIDs["ETIT Bachelorstudent"]
		)
			? config.ids.einteilung.ETITersti
			: newMember.roles.cache.has(config.ids.roleIDs["MIT Bachelorstudent"])
			? config.ids.einteilung.MITersti
			: undefined

		if (IDNum == config.ids.roleIDs.Ophase && memberCourseOfStudies != undefined) {
			const ophaseInfo = new discord.MessageEmbed()
				.setTitle(`🗲 Personalisierung 🗲`)
				.setColor("#FFDA00")
				.setAuthor(client.user.tag, newMember.guild.iconURL())
				.setThumbnail(
					client.guilds
						.resolve(config.ids.serverID)
						.members.resolve(config.ids.userID.botUserID)
						.user.avatarURL()
				)
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
