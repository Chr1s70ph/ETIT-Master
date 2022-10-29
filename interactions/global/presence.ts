import { EmbedBuilder } from '@discordjs/builders'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PresenceStatusData, PermissionsBitField, ActivitiesOptions } from 'discord.js'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordSlashCommandBuilder } from '../../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('presence')
  .setDescription('Change the bots rich presence')
  .setLocalizations('presence')
  .addSubcommand(subcommand =>
    subcommand
      .setName('set')
      .setDescription('Change Presence')
      .addStringOption(option =>
        option
          .setName('status')
          .setDescription('Change status')
          .addChoices(
            { name: 'online', value: 'online' },
            { name: 'idle', value: 'idle' },
            { name: 'dnd', value: 'dnd' },
            { name: 'invisible', value: 'invisible' },
          )
          .setRequired(true),
      )
      .addNumberOption(option =>
        option
          .setName('type')
          .setDescription('Change Activity Type')
          .addChoices(
            { name: 'Playing', value: 0 },
            { name: 'Streaming', value: 1 },
            { name: 'Listening', value: 2 },
            { name: 'Watching', value: 3 },
            { name: 'Custom', value: 4 },
            { name: 'Competing', value: 5 },
          )
          .setRequired(true),
      )
      .addStringOption(option => option.setName('name').setDescription('What is the bot doing?').setRequired(true)),
  )
  .addSubcommand(subcommand => subcommand.setName('reset').setDescription('Reset Rich presence to default presences.'))
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply()

  /**
   * Check if user has the needed rights to use the command
   */
  if (!Object.values(client.config.ids.acceptedAdmins).includes(interaction.user.id)) {
    interaction.reply({
      content: client.translate({ key: 'missingPermission', options: { lng: interaction.user.language } }),
    })
  }

  /**
   * Check if user wants to reset the current presence
   */
  if (interaction.options.getSubcommand() === 'reset') {
    /**
     * Set customPresence saved on client to null
     */
    client.customPresence = null

    /**
     * Set Presence to first presence defined in the config
     */
    client.user.setPresence(client.config.presence[0])

    /**
     * Send answer, that presence has been changed
     */
    await interaction.editReply({
      embeds: [new EmbedBuilder().setDescription('Presence reverted')],
    })
    return
  }

  /**
   * {@link PresenceStatusData} from {@link DiscordChatInputCommandInteraction}
   */
  const status = interaction.options.getString('status') as PresenceStatusData

  /**
   * {@link ActivitiesOptions} name from {@link DiscordChatInputCommandInteraction}
   */
  const name = interaction.options.getString('name').startsWith('\\')
    ? interaction.options.getString('name').split('\\')[1]
    : interaction.options.getString('name')

  /**
   * {@link ActivitiesOptions} type from {@link DiscordChatInputCommandInteraction}
   */
  const type = interaction.options.getNumber('type')

  /**
   * Set customPresence on client
   */
  client.customPresence = {
    status: status,
    activities: [{ name: name, type: type }],
  }

  /**
   * Update client presence
   */
  client.user.setPresence(client.customPresence)

  /**
   * Send reply, that presence has been updated
   */
  await interaction.editReply({
    embeds: [new EmbedBuilder().setDescription(client.customPresence.toString())],
  })
}
