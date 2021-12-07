/* eslint-disable max-len */
import { MessageEmbed } from 'discord.js'
import { GuildMember } from 'discord.js/typings/index.js'
import { DiscordClient } from '../types/customTypes'

exports.run = (client: DiscordClient, member: GuildMember) => {
  /**
   * Guild to update update membercounter.
   */
  const guild = client.guilds.cache.get(client.config.ids.serverID)

  /**
   * Fetch number of guild members.
   */
  const memberCount = guild.memberCount

  /**
   * Channel to update membercount.
   */
  const channel = guild.channels.cache.get(client.config.ids.channelIDs.dev.memberCounter)

  /**
   * Update membercounter.
   */
  channel.setName(`👥 ${memberCount.toLocaleString()} Mitglieder`)
  console.log(`${member.user.username} joined. Updated membercount to ${memberCount.toLocaleString()}`)

  /**
   * Send welcome message to new user.
   */
  sendWelcomeMessage(member, client)
}

/**
 * Send a welcome message.
 * @param {GuildMember} member Member to send the welcome message to
 * @param {DiscordClient} client Bot-Client
 */
function sendWelcomeMessage(member: GuildMember, client: DiscordClient): void {
  /**
   * Create a welcome message.
   */
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
    /**
     * Send personalized embed to member.
     */
    member.send({ embeds: [welcomeMessage] })
    console.log(`Sent welcome message to ${member.user.username}`)
  } catch (error) {
    /**
     * Handle Errors.
     */
    throw new Error(error)
  }
}
