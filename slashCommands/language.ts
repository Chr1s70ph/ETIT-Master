import { readdir } from 'fs/promises'
import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageActionRow, MessageSelectMenu } from 'discord.js'
import { DiscordClient, DiscordCommandInteraction, DiscordSelectMenuInteraction } from '../types/customTypes'

export const data = new SlashCommandBuilder().setName('language').setDescription('Choose your language')

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction) => {
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
  })
}

exports.SelectMenu = (client: DiscordClient, interaction: DiscordSelectMenuInteraction) => {
  /**
   * TODO reply to select menu
   */
  console.log('HERE')
}
