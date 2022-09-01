import {
  EmbedBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  ModalActionRowComponentBuilder,
  ActionRowBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import { DiscordClient, DiscordCommandInteraction, DiscordModalSubmitInteraction } from '../types/customTypes'
const createIssue = require('github-create-issue')
const REPOSITORY = 'Chr1s70ph/ETIT-Master'

export const data = new SlashCommandBuilder().setName('vorschlag').setDescription('Schlage etwas vor!')

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  /**
   * Input field for the tile
   */
  const titleInput = new TextInputBuilder()
    .setCustomId('titleInput')
    .setLabel(client.translate({ key: 'interactions.issue.title_input', lng: interaction.user.language }))
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
  const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().setComponents(titleInput)

  /**
   * Input field for the body
   */
  const bodyInput = new TextInputBuilder()
    .setCustomId('bodyInput')
    .setLabel(client.translate({ key: 'interactions.issue.body_input', lng: interaction.user.language }))
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
  const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().setComponents(bodyInput)

  /**
   * Show modal
   */
  await interaction.showModal(
    new ModalBuilder().setTitle('Vorschlag').setCustomId('vorschlag').addComponents(firstActionRow, secondActionRow),
  )
}

exports.Modal = async (client: DiscordClient, interaction: DiscordModalSubmitInteraction) => {
  /**
   * Title of the new issue
   */
  const issue_title = interaction.fields.getTextInputValue('titleInput')

  /**
   * Body of the new issue
   */
  const issue_body = interaction.fields.getTextInputValue('bodyInput')

  /**
   * Options to send to the Github-API
   */
  const options = {
    token: client.config.github_token,
    body: issue_body,
  }
  try {
    /**
     * Create new issue with {@link issue_title} and {@link issue_body}
     */
    createIssue(REPOSITORY, `${interaction.user.username}'s Vorschlag ${issue_title}`, options, clbk)
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(client.translate({ key: 'interactions.issue.recieved', lng: interaction.user.language }))
          .setDescription(client.translate({ key: 'interactions.issue.thanks', lng: interaction.user.language })),
      ],
      ephemeral: true,
    })
  } catch (error) {
    /**
     *  Error handling
     */
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(client.translate({ key: 'interactions.issue.error', lng: interaction.user.language }))
          .setDescription(client.translate({ key: 'interactions.issue.tryAgain', lng: interaction.user.language })),
      ],
    })
    throw new Error(error)
  }
}

function clbk(error: Error, issue: object, info): void {
  if (info) {
    console.error('Limit: %d', info.limit)
    console.error('Remaining: %d', info.remaining)
    console.error('Reset: %s', new Date(info.reset * 1000).toISOString())
  }
  if (error) {
    throw new Error(error.message)
  }
  console.log(issue)
}
