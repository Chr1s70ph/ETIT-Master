import {
  EmbedBuilder,
  MessageType,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
} from 'discord.js'
import {
  DiscordModalSubmitInteraction,
  DiscordMessage,
  DiscordClient,
  DiscordCommandInteraction,
  DiscordSlashCommandBuilder,
} from '../types/customTypes'

let attachment

export const data = new DiscordSlashCommandBuilder()
  .setName('say')
  .setDescription('Prüft, ob der Bot ordnungsgemäß antwortet')
  .setLocalizations('say')
  .addAttachmentOption(option => option.setName('attachment').setDescription('nice picture ;)'))

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  if (!Object.values(client.config.ids.acceptedAdmins).includes(interaction.user.id)) {
    interaction.reply({
      content: client.translate({ key: 'missingPermission', lng: interaction.user.language }),
    })
  }

  attachment = interaction.options.get('attachment')

  console.log(attachment)

  /**
   * Input field for the body
   */
  const modal_body = new TextInputBuilder()
    .setCustomId('modal_content')
    .setLabel('Funny here, aint it')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
  const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().setComponents(modal_body)

  /**
   * Show modal
   */
  await interaction.showModal(new ModalBuilder().setTitle('Say').setCustomId('say').addComponents(actionRow))
}

exports.Modal = async (client: DiscordClient, interaction: DiscordModalSubmitInteraction) => {
  const content = interaction.fields.getTextInputValue('modal_content')
  const embed = new EmbedBuilder().setDescription(content).setColor('Random')

  interaction.reply({ embeds: [embed] })
  interaction.followUp({ attachments: [attachment] })
}

exports.run = (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Embed to send back.
   */
  const embed = createEmbed(message, client)

  /**
   * Send reply based on message type.
   */
  return message.type === MessageType.Reply
    ? client.reply(message, { embeds: [embed] })
    : client.send(message, { embeds: [embed] })
}

/**
 *
 * @param {DiscordMessage} message command Message
 * @param {DiscordClient} client Bot-Client
 * @returns {EmbedBuilder} embed with given message.content
 */
function createEmbed(message: DiscordMessage, client: DiscordClient): EmbedBuilder {
  const messageContent = message.content.substring(message.content.indexOf(' ') + client.config.prefix.length)

  const embed = new EmbedBuilder()
    .setDescription(messageContent === `${client.config.prefix}say` ? '᲼' : messageContent)
    .setColor('Random')

  const messageAttachment = message.attachments.size > 0 ? message.attachments.first().url : null
  embed.setImage(messageAttachment)
  return embed
}
