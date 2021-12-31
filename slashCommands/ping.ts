import { SlashCommandBuilder } from '@discordjs/builders'

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Prüft, ob der Bot ordnungsgemäß antwortet')

exports.respond = async (client: any, interaction: any): Promise<void> => {
  console.log(`User ${interaction.user.username} issued /ping`)
  await interaction.reply({ content: 'pong', ephemeral: true })
}
