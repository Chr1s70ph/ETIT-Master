import { EmbedBuilder, TextChannel } from 'discord.js'
import { GuildMember } from 'discord.js/typings/index.js'
import { DiscordClient } from '../types/customTypes'

exports.run = async (client: DiscordClient, member: GuildMember) => {
  /**
   * Only react to members joining the ETIT-KIT server.
   */
  if (member.guild.id !== client.config.ids.serverID) return

  await serverWelcomeMessage(client, member)

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
  await sendWelcomeMessage(member, client)
}

async function serverWelcomeMessage(client: DiscordClient, member: GuildMember) {
  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(member.user.username)
    .setDescription(`<@${member.user.id}> ist dem Server beigetreten!`)
    .addFields([
      { name: 'Server beigetreten am', value: `<t:${Math.round(member.joinedTimestamp / 1000)}:D>`, inline: false },
    ])
    .addFields([
      { name: 'Account erstellt am', value: `<t:${Math.round(member.user.createdTimestamp / 1000)}:D>`, inline: false },
    ])
    .setAuthor({ name: '💎 Mitglieder-Beitritt' })
    .setThumbnail(member.user.avatarURL())

  const channel = client.channels.cache.find(
    _channel => _channel.id === client.config.ids.channelIDs.NUTZER_UPDATES,
  ) as TextChannel

  await channel.send({
    embeds: [embed],
  })
}

/**
 * Send a welcome message.
 * @param {GuildMember} member Member to send the welcome message to
 * @param {DiscordClient} client Bot-Client
 */
async function sendWelcomeMessage(member: GuildMember, client: DiscordClient): Promise<void> {
  /**
   * Create a welcome message.
   */
  const welcomeMessage = new EmbedBuilder()
    .setTitle(`🗲 Willkommen auf dem ETIT-KIT Server ${member.user.username} 🗲`)
    .setColor('#FFDA00')
    .setAuthor({ name: client.user.tag, iconURL: member.guild.iconURL() })
    .setThumbnail(client.user.avatarURL())
    .setDescription(
      `Wir hoffen, dass der Server dir gefällt, und dir im Studium weiterhelfen kann.
		In <#830837597587767306> kannst du deinen Studiengang auswählen.
		In der Kategorie <#830891013266604062> findest du dann weitere Kanäle, in denen du deine Fächer auswählen kannst.

		Falls du noch irgendwelche Fragen hast, wende dich einfach an <@${client.config.ids.userID.basti}>` +
        ` (wir Admins sind auch nur einfache Studenten, genauso wie du).`,
    )

  try {
    /**
     * Send personalized embed to member.
     */
    await member.send({ embeds: [welcomeMessage] })
    console.log(`Sent welcome message to ${member.user.username}`)
  } catch (error) {
    /**
     * Handle Errors.
     */
    console.error(error)
  }
}
