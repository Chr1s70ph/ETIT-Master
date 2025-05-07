import { GuildMember, EmbedBuilder, TextChannel } from 'discord.js'
import { DiscordClient } from '../types/customTypes'

exports.run = async (client: DiscordClient, member: GuildMember) => {
  /**
   * Only react to members joining the ETIT-KIT server.
   */
  if (member.guild.id !== client.config.ids.serverID) return

  await serverGoodByeMessage(client, member)
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
  console.log(`${member.user.username} left. Updated membercount to ${memberCount.toLocaleString()}`)
}

async function serverGoodByeMessage(client: DiscordClient, member: GuildMember) {
  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle(member.user.username)
    .setDescription(`<@${member.user.id}> hat den Server verlassen!`)
    .addFields([
      { name: 'Server beigetreten am', value: `<t:${Math.round(member.joinedTimestamp / 1000)}:D>`, inline: false },
    ])
    .addFields([
      { name: 'Account erstellt am', value: `<t:${Math.round(member.user.createdTimestamp / 1000)}:D>`, inline: false },
    ])
    .setAuthor({ name: '😭 Mitglieder-Austritt' })
    .setThumbnail(member.user.avatarURL())

  const channel = client.channels.cache.find(
    _channel => _channel.id === client.config.ids.channelIDs.NUTZER_UPDATES,
  ) as TextChannel

  await channel.send({
    embeds: [embed],
  })
}
