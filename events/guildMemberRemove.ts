import { GuildMember, EmbedBuilder, TextChannel } from 'discord.js'
import { DiscordClient } from '../types/customTypes'

exports.run = (client: DiscordClient, member: GuildMember) => {
  serverGoodByeMessage(client, member)
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
    .setTitle(`${member.user.username}#${member.user.discriminator}`)
    .setDescription(`<@${member.user.id}> hat den Server verlassen!`)
    .addFields([{ name: 'Server beigetreten am', value: member.joinedAt.toString(), inline: false }])
    .addFields([{ name: 'Account erstellt am', value: member.user.createdAt.toString(), inline: false }])
    .setAuthor({ name: '😭 Mitglieder-Austritt' })
    .setThumbnail(member.user.avatarURL())

  const channel = (await client.channels.cache.find(
    _channel => _channel.id === client.config.ids.channelIDs.NUTZER_UPDATES,
  )) as TextChannel

  channel.send({
    embeds: [embed],
  })
}
