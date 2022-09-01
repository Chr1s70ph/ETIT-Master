import { DiscordClient, DiscordCommandInteraction, DiscordSlashCommandBuilder } from '../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('ping')
  .setDescription('Prüft, ob der Bot ordnungsgemäß antwortet')
  .setLocalizations('ping')

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  await interaction.reply({ content: 'pong', ephemeral: true })
}
