import { MessageFlags } from 'discord.js'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordSlashCommandBuilder } from '../../types/customTypes'


export const data = new DiscordSlashCommandBuilder()
  .setName('ping')
  .setDescription('Prüft, ob der Bot ordnungsgemäß antwortet')
  .setLocalizations('ping')

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.reply({ content: 'pong', flags: MessageFlags.Ephemeral })
}
