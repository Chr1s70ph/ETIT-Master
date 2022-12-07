import { DiscordClient, DiscordChatInputCommandInteraction, DiscordSlashCommandBuilder } from '../../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('maintenance')
  .setDescription('Stecking the bot in the mainenance mode')
  .setLocalizations('maintenance')

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply()
  if (!Object.values(client.config.ids.acceptedAdmins).includes(interaction.user.id)) {
    await interaction.editReply({
      content: client.translate({ key: 'missingPermission', options: { lng: interaction.user.language } }),
    })
    return
  }

  console.log('hello')
}
