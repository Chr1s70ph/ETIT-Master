import { SlashCommandBuilder } from '@discordjs/builders'
import { DiscordClient, DiscordCommandInteraction } from '../types/customTypes'

export const data = new SlashCommandBuilder()
  .setName('studiengang')
  .setDescription('Wähle deinen studiengang aus.')
  .addStringOption(option =>
    option
      .setName('studiengang')
      .setDescription('Dein jetziger studiengang')
      .addChoices([
        ['etit-bachelor', 'etit-bachelor'],
        ['mit-bachelor', 'mit-bachelor'],
        ['etit-master', 'etit-master'],
        ['mit-master', 'mit-master'],
      ]),
  )

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  await interaction.reply({ content: 'pong', ephemeral: true })
}
