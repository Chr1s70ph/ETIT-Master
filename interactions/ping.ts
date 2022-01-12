import { SlashCommandBuilder } from '@discordjs/builders'
import { DiscordClient, DiscordChatInputCommandInteraction } from '../types/customTypes'

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Prüft, ob der Bot ordnungsgemäß antwortet')

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.reply({ content: 'pong', ephemeral: true })
}
