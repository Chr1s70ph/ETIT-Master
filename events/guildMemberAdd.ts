/* eslint-disable max-len */
import { MessageEmbed } from 'discord.js'
import { GuildMember } from 'discord.js/typings/index.js'
import { DiscordClient } from '../types/customTypes'

exports.run = (client: DiscordClient, member: GuildMember) => {
  const guild = client.guilds.cache.get(client.config.ids.serverID)
  const memberCount = guild.memberCount
  const channel = guild.channels.cache.get(client.config.ids.channelIDs.dev.memberCounter)
  channel.setName(`👥 ${memberCount.toLocaleString()} Mitglieder`)
  console.log(`${member.user.username} joined. Updated membercount to ${memberCount.toLocaleString()}`)

  sendWelcomeMessage(member, client)
}

function sendWelcomeMessage(member: GuildMember, client: DiscordClient): void {
  const welcomeMessage = new MessageEmbed()
    .setTitle(`🗲 Willkommen auf dem ETIT-KIT Server ${member.user.username} 🗲`)
    .setColor('#FFDA00')
    .setAuthor({ name: client.user.tag, iconURL: member.guild.iconURL() })
    .setThumbnail(client.user.avatarURL())
    .setDescription(`Wir hoffen, dass der Server dir gefällt, und dir im Studium weiterhelfen kann.
		In <#830837597587767306> kannst du deinen Studiengang auswählen.
		In der Kategorie <#830891013266604062> findest du dann weitere Kanäle, in denen du deine Fächer auswählen kannst.
		
		Falls du noch irgendwelche Fragen hast, wende dich einfach an <@${client.config.ids.userID.basti}> (wir Admins sind auch nur einfache Studenten, genauso wie du).`)

  try {
    member.send({ embeds: [welcomeMessage] })
    console.log(`Sent welcome message to ${member.user.username}`)
  } catch (error) {
    throw new Error(error)
  }
}
