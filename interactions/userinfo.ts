import { EmbedBuilder } from 'discord.js'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordSlashCommandBuilder } from '../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Zeigt informationen über Nutzer an.')
  .setLocalizations('userinfo')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('Der Nutzer, über den Informationen angezeigt werden sollen')
      .setRequired(true),
  )

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply()

  const target_user = interaction.options.getUser('user')
  const target_guildMember = interaction.guild.members.cache.find(foundUser => foundUser.id === target_user.id)
  /**
   * A forced fetch is required, otherwise the banner will not be accessible
   */
  const target_forceFetchedUser = await client.users.fetch(target_user, { force: true })
  const userPremiumSinceTimestamp = target_guildMember.premiumSinceTimestamp
    ?.toString()
    .substring(0, target_guildMember.premiumSinceTimestamp?.toString().length - 3)

  const embed = new EmbedBuilder()
    .setTitle(`${client.translate({ key: 'interactions.userinfo.userinfo', lng: interaction.user.language })}:`)
    .addFields([
      {
        name: `${client.translate({ key: 'interactions.userinfo.name', lng: interaction.user.language })}:`,
        value: target_user.username,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.userinfo.tag', lng: interaction.user.language })}:`,
        value: `#${target_user.tag.split('#')[1]}`,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.userinfo.nickname', lng: interaction.user.language })}:`,
        value: target_guildMember.displayName,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.userinfo.bot_user', lng: interaction.user.language })}:`,
        value: `${target_user.bot}`,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.userinfo.highest_role', lng: interaction.user.language })}:`,
        value: `<@&${target_guildMember.roles.highest.id}>`,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.userinfo.joined', lng: interaction.user.language })}:`,
        value: `<t:${Math.round(target_guildMember.joinedTimestamp / 1000)}:D>`,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.userinfo.account_created', lng: interaction.user.language })}:`,
        value: `<t:${Math.round(target_user.createdTimestamp / 1000)}:D>`,
        inline: true,
      },
      {
        name: `${client.translate({ key: 'interactions.userinfo.nitro', lng: interaction.user.language })}:`,
        value: `${
          userPremiumSinceTimestamp
            ? `<t:${userPremiumSinceTimestamp}:D>`
            : client.translate({ key: 'interactions.userinfo.no_nitro', lng: interaction.user.language })
        }`,
        inline: true,
      },
    ])
    .setThumbnail(target_user.displayAvatarURL({ size: 4096 }))
    .setImage(target_forceFetchedUser.bannerURL({ size: 4096 }))
    .setColor(target_guildMember.displayHexColor)

  await interaction.editReply({ embeds: [embed] })
}

// .setAuthor({
//   name: client.translate({ key: 'interactions.help.title', lng: interaction.user.language }),
//   iconURL: 'https://bit.ly/3CJU0lf',
// })
