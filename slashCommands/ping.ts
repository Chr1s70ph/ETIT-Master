import { SlashCommandBuilder } from '@discordjs/builders'
import { DiscordClient, DiscordInteraction } from '../types/customTypes'

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Prüft, ob der Bot ordnungsgemäß antwortet')

exports.Command = async (client: DiscordClient, interaction: DiscordInteraction): Promise<void> => {
  await interaction.reply({ content: 'pong', ephemeral: true })
}
