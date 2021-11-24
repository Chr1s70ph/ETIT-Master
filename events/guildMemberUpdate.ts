/* eslint-disable max-len */
import { MessageEmbed } from 'discord.js'
import { GuildMember } from 'discord.js/typings/index.js'
import { DiscordClient } from '../types/customTypes'

exports.run = (client: DiscordClient, oldMember: GuildMember, newMember: GuildMember) => {
  const oldRoleIDs = []
  oldMember.roles.cache.each(role => {
    oldRoleIDs.push(role.id)
  })
  const newRoleIDs = []
  newMember.roles.cache.each(role => {
    newRoleIDs.push(role.id)
  })
  // Check if the newRoleIDs had one more role, which means it added a new role
  if (newRoleIDs.length > oldRoleIDs.length) {
    const onlyRole = newRoleIDs.filter(filterOutOld)
    const IDNum = onlyRole[0]
    const memberCourseOfStudies = newMember.roles.cache.has(client.config.ids.roleIDs['ETIT Bachelorstudent'])
      ? 'ETIT Bachelorstudent'
      : newMember.roles.cache.has(client.config.ids.roleIDs['MIT Bachelorstudent'])
      ? 'MIT Bachelorstudent'
      : undefined

    // Get right classification channel based on role
    const memberClassificationchannel = newMember.roles.cache.has(client.config.ids.roleIDs['ETIT Bachelorstudent'])
      ? client.config.ids.channelIDs.ETITPersonalization
      : newMember.roles.cache.has(client.config.ids.roleIDs['MIT Bachelorstudent'])
      ? client.config.ids.channelIDs.MITPersonalization
      : undefined
    // Get link to message in memberClassificationchannel
    const memberClassificationLink = newMember.roles.cache.has(client.config.ids.roleIDs['ETIT Bachelorstudent'])
      ? client.config.ids.einteilung.ETITersti
      : newMember.roles.cache.has(client.config.ids.roleIDs['MIT Bachelorstudent'])
      ? client.config.ids.einteilung.MITersti
      : undefined

    if (IDNum === client.config.ids.roleIDs.Ophase && memberCourseOfStudies !== undefined) {
      const ophaseInfo = new MessageEmbed()
        .setTitle(`🗲 Personalisierung 🗲`)
        .setColor('#FFDA00')
        .setAuthor({ name: client.user.tag, iconURL: newMember.guild.iconURL() })
        .setThumbnail(client.user.avatarURL())
        .setDescription(
          `Meine Spione haben mir erzählt, dass du \`${memberCourseOfStudies}\` bist.
					In [<#${memberClassificationchannel}>](${memberClassificationLink}) kannst du dich weiter einteilen, und die Fächer für dein Semester auswählen.`,
        )

      try {
        console.log(`Sent ${newMember.user.username} personalization message`)
        return newMember.send({ embeds: [ophaseInfo] })
      } catch (error) {
        throw new Error(error)
      }
    } else {
      return 0
    }
  } else {
    return 0
  }
}

function filterOutOld(id, oldRoleIDs) {
  for (let i = 0; i < oldRoleIDs.length; i++) {
    if (id === oldRoleIDs[i]) {
      return false
    }
  }
  return true
}
