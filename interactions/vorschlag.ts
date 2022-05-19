import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageActionRow, Modal, ModalActionRowComponent, TextInputComponent } from 'discord.js'
import { DiscordClient, DiscordCommandInteraction, DiscordModalSubmitInteraction } from '../types/customTypes'
const createIssue = require('github-create-issue')
const REPOSITORY = 'Chr1s70ph/ETIT-Master'

export const data = new SlashCommandBuilder().setName('vorschlag').setDescription('Schlage etwas vor!')

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  // Input field for the tile
  const titleInput = new TextInputComponent()
    .setCustomId('titleInput')
    .setLabel('Watt schlägste vor Minium?')
    .setStyle('SHORT')
  const firstActionRow = new MessageActionRow<ModalActionRowComponent>().setComponents(titleInput)

  // Input field for the body
  const bodyInput = new TextInputComponent()
    .setCustomId('bodyInput')
    .setLabel('Erzähl doch noch n bissl')
    .setStyle('PARAGRAPH')
  const secondActionRow = new MessageActionRow<ModalActionRowComponent>().setComponents(bodyInput)

  // Show modal
  await interaction.showModal(
    new Modal().setTitle('Vorschlag').setCustomId('vorschlag').addComponents(firstActionRow, secondActionRow),
  )
}

exports.Modal = async (client: DiscordClient, interaction: DiscordModalSubmitInteraction) => {
  // TODO use modal inputs instead of options
  // const interactionOptions = interaction.options as CommandInteractionOptionResolver
  // const options = {
  //   token: client.config.github_token,
  //   body: interactionOptions.getString('vorschlag'),
  // }
  // try {
  //   createIssue(
  //     REPOSITORY,
  //     `${interaction.user.username}'s Vorschlag${
  //       interactionOptions.getString('titel') ? `: ${interactionOptions.getString('titel')}` : ''
  //     }`,
  //     options,
  //     clbk,
  //   )
  //   await interaction.reply({
  //     embeds: [
  //       new MessageEmbed()
  //         .setTitle(client.translate({ key: 'interactions.issue.Recieved', lng: interaction.user.language }))
  //         .setDescription(client.translate({ key: 'interactions.issue.Thanks', lng: interaction.user.language })),
  //     ],
  //     ephemeral: true,
  //   })
  // } catch (error) {
  //   await interaction.reply({
  //     embeds: [
  //       new MessageEmbed()
  //         .setTitle(client.translate({ key: 'interactions.issue.Error', lng: interaction.user.language }))
  //         .setDescription(client.translate({ key: 'interactions.issue.TryAgain', lng: interaction.user.language })),
  //     ],
  //   })
  //   throw new Error(error)
  // }
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
