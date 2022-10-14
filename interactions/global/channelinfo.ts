import { EmbedBuilder, GuildBasedChannel, ChannelType } from 'discord.js'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordSlashCommandBuilder } from '../../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('channelinfo')
  .setDescription('Zeigt informationen über einen Kanal an.')
  .setLocalizations('channelinfo')
  .addChannelOption(option =>
    option
      .setName('channel')
      .setDescription('Der Kanal, über den Informationen angezeigt werden sollen')
      .setRequired(true),
  )

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  /**
   * Defer interaction, so that no timeout error occurs
   */
  await interaction.deferReply()

  /**
   * Target {@link GuildBasedChannel} to get information about
   */
  const target_channel_id = interaction.options.getChannel('channel').id

  const target_channel: GuildBasedChannel = interaction.guild.channels.cache.find(
    channel => channel.id === target_channel_id,
  )

  /**
   * Embed with information about {@link target_channel}
   */
  const embed = new EmbedBuilder()
    .setTitle(`${client.translate({ key: 'interactions.channelinfo.channelinfo', lng: interaction.user.language })}:`)
    .addFields([
      {
        name: `${client.translate({ key: 'interactions.channelinfo.name', lng: interaction.user.language })}:`,
        value: target_channel.name,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.channelinfo.created_at', lng: interaction.user.language })}:`,
        value: `<t:${target_channel.createdTimestamp
          .toString()
          .substring(target_channel.createdTimestamp.toString().length - 3)}:D>`,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.channelinfo.parent', lng: interaction.user.language })}:`,
        value: target_channel.parent?.toString() ? target_channel.parent?.toString() : target_channel.toString(),
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.channelinfo.type', lng: interaction.user.language })}:`,
        value: `[${
          ChannelType[target_channel.type.toString()]
        }](https://discord.com/developers/docs/resources/channel#channel-object-channel-types)`,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.channelinfo.id', lng: interaction.user.language })}:`,
        value: target_channel.id,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.channelinfo.guild_id', lng: interaction.user.language })}:`,
        value: target_channel.guildId,
        inline: true,
      },
    ])
    .setColor('Orange')

  /**
   * Edit reply of interaction with {@link embed}
   */
  await interaction.editReply({ embeds: [embed] })
}
