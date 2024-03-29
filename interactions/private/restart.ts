import { PermissionsBitField } from 'discord.js'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordSlashCommandBuilder } from '../../types/customTypes'
/**
 * Const required, otherwise pm2 throws an error.
 */
const pm2 = require('pm2')

export const data = new DiscordSlashCommandBuilder()
  .setName('restart')
  .setDescription('lololololo')
  .setLocalizations('restart')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply()
  if (!Object.values(client.config.ids.acceptedAdmins).includes(interaction.user.id)) {
    await interaction.editReply({
      content: client.translate({ key: 'missingPermission', options: { lng: interaction.user.language } }),
    })
    return
  }

  await interaction.editReply({
    content: client.translate({ key: 'interactions.restart.answer', options: { lng: interaction.user.language } }),
  })

  pm2.connect(err => {
    if (err) {
      throw new Error(err)
    }
    try {
      pm2.restart(process.env.pm_id, null)
    } catch (error) {
      throw new Error(error)
    }
  })
}
