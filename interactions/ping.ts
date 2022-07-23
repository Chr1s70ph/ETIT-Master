import { SlashCommandBuilder } from 'discord.js'
import { DiscordClient, DiscordCommandInteraction } from '../types/customTypes'

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Prüft, ob der Bot ordnungsgemäß antwortet')

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  await interaction.reply({ content: 'pong', ephemeral: true })
}
