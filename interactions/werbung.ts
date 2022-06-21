import { SlashCommandBuilder } from '@discordjs/builders'
import {
  MessageActionRow,
  MessageEmbed,
  Modal,
  ModalActionRowComponent,
  TextInputComponent,
  TextChannel,
} from 'discord.js'
import { DiscordClient, DiscordCommandInteraction, DiscordModalSubmitInteraction } from '../types/customTypes'

export const data = new SlashCommandBuilder().setName('werbung').setDescription('Schlage etwas vor!')

//  TODO:
//  - Translate inputfields, cuz yeah
//  - make embed sent to admin channel nice
//  - link to user in embed
//  - basic information about user in embed

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  /**
   * Input field for the tile
   */
  const titleInput = new TextInputComponent()
    .setCustomId('titleInput')
    .setLabel('Watt schlägste vor Minium?')
    .setStyle('SHORT')
    .setRequired(true)
  const firstActionRow = new MessageActionRow<ModalActionRowComponent>().setComponents(titleInput)

  /**
   * Input field for the body
   */
  const bodyInput = new TextInputComponent()
    .setCustomId('bodyInput')
    .setLabel('Erzähl doch noch n bissl')
    .setStyle('PARAGRAPH')
    .setRequired(true)
  const secondActionRow = new MessageActionRow<ModalActionRowComponent>().setComponents(bodyInput)

  /**
   * Show modal
   */
  await interaction.showModal(
    new Modal().setTitle('Werbung').setCustomId('werbung').addComponents(firstActionRow, secondActionRow),
  )
}

exports.Modal = (client: DiscordClient, interaction: DiscordModalSubmitInteraction) => {
  const advertisement_title = interaction.fields.getTextInputValue('titleInput')

  const advertisement_body = interaction.fields.getTextInputValue('bodyInput')

  const channel = client.channels.cache.find(
    _channel => _channel.id === client.config.ids.channelIDs.dev.admin,
  ) as TextChannel

  channel.send({
    content: '<@&757982430182506549>',
    embeds: [
      new MessageEmbed()
        .setTitle('Werbeantrag')
        .setDescription(`**${advertisement_title}**\n${advertisement_body}`)
        .setAuthor({
          name: `<@${interaction.user.id}>`,
          iconURL: interaction.user.avatarURL(),
        }),
    ],
  })

  interaction.reply({ embeds: [new MessageEmbed().setTitle('Thanks')], ephemeral: true })
}
