import { SlashCommandBuilder } from '@discordjs/builders'
import { DiscordClient, DiscordCommandInteraction } from '../types/customTypes'

export const data = new SlashCommandBuilder()
  .setName('rollenauswahl')
  .setDescription('Wähle deine Rollen')
  .addSubcommand(subcommand =>
    subcommand
      .setName('studiengang')
      .setDescription('Wähle deinen Studiengang')
      .addStringOption(option =>
        option
          .setDescription('Wähle deinen Studiengang')
          .setRequired(true)
          .setName('studiengang')
          .setChoices([
            ['ETIT Bachelor', 'etit-bachelor'],
            ['ETIT Master', 'etit-master'],
            ['MIT Bachelor', 'mit-bachelor'],
            ['MIT Master', 'mit-master'],
            ['KIT Bachelor', 'kit-bachelor'],
            ['KIT Master', 'kit-master'],
          ]),
      ),
  )
  .addSubcommand(subcommand => subcommand.setName('fächer').setDescription('Wähle deine Fächer'))
  .addSubcommand(subcommand => subcommand.setName('freizeit').setDescription('Wähle deine Freizeit Rollen'))

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  await interaction.reply({ content: `${interaction.options.data[0].value}` })
}
