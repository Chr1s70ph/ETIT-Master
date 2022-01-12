import { readdir } from 'fs/promises'
import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js'
import { DiscordClient, DiscordChatInputCommandInteraction } from '../types/customTypes'

export const data = new SlashCommandBuilder().setName('language').setDescription('Choose your language')

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction) => {
  /**
   * Array containing names of all language files
   */
  const langFiles = await readdir('./locales/')

  /**
   * Otions for {@link MessageActionRow}
   */
  let options = []

  /**
   * Lopp through all languages
   */
  for (const file in langFiles) {
    /**
     * Language indicator
     */
    const lang = langFiles[file].split('.')[0]

    /**
     * Language fully written out
     */
    const languageName = client.translate({ key: 'language', lng: lang })

    /**
     * Option for {@link MessageActionRow}
     */
    const option = {
      label: `${client.translate({ key: 'flag', lng: lang })} ${languageName}`,
      description: languageName,
      value: lang,
    }

    /**
     * Add option to Array of all possible options
     */
    options = [...options, option]
  }

  /**
   * Create new {@link MessageActionRow}
   */
  const row = new MessageActionRow().addComponents(
    /**
     * Add {@link MessageSelectMenu}
     */
    new MessageSelectMenu()
      .setCustomId('language')
      .setPlaceholder(client.translate({ key: 'slashCommands.language.DefaultSelect', lng: interaction.user.language }))
      .addOptions(options),
  )

  /**
   * Reply with {@link row} to interaction
   */
  await interaction.reply({
    content: client.translate({ key: 'slashCommands.language.Select', lng: interaction.user.language }),
    components: [row],
    ephemeral: true,
  })
}

exports.SelectMenu = async (client: DiscordClient, interaction: SelectMenuInteraction) => {
  const interactionUser = await interaction.guild.members.fetch(interaction.user.id)
  const userRoles = interactionUser.roles.cache.map(role => role)

  /**
   * Remove all language roles
   */
  await interactionUser.roles.remove(userRoles.filter(role => role.name.length === 2))
  if (interaction.values[0] !== 'en') {
    /**
     * Fetch language Role
     */
    const languageRole = await interaction.guild.roles.cache.find(role => role.name === interaction.values[0])
    /**
     * Give user language Role
     */
    interactionUser.roles.add(languageRole)
    console.log(`Gave ${interactionUser.displayName} languageRole: ${languageRole.name}`)
  }
  /**
   * Flag of selected language
   */
  const flag = client.translate({ key: 'flag', lng: interaction.values[0] })

  /**
   * Name of selected language
   */
  const language = client.translate({ key: 'language', lng: interaction.values[0] })

  /**
   * Notify user, that language has been updated
   */
  interaction.update({
    content: null,
    embeds: [
      new MessageEmbed()
        .setTitle(
          client.translate({
            key: 'slashCommands.language.LanguageUpdated',
            options: {
              language: `${flag} ${language}`,
              lng: interaction.values[0],
            },
          }),
        )
        .setFooter({ text: client.user.username, iconURL: client.user.avatarURL() }),
    ],
    components: [],
  })
}
