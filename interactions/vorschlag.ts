import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteractionOptionResolver, MessageEmbed } from 'discord.js'
import { DiscordClient, DiscordChatInputCommandInteraction } from '../types/customTypes'
const createIssue = require('github-create-issue')
const REPOSITORY = 'Chr1s70ph/ETIT-Master'

export const data = new SlashCommandBuilder()
  .setName('vorschlag')
  .setDescription('Schlage etwas vor!')
  .addStringOption(option => option.setName('vorschlag').setDescription('Mein Vorschlag').setRequired(true))
  .addStringOption(option => option.setName('titel').setDescription('Titel meines Vorschlages'))

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  const interactionOptions = interaction.options as CommandInteractionOptionResolver

  const options = {
    token: client.config.github_token,
    body: interactionOptions.getString('vorschlag'),
  }

  try {
    createIssue(
      REPOSITORY,
      `${interaction.user.username}'s Vorschlag${
        interactionOptions.getString('titel') ? `: ${interactionOptions.getString('titel')}` : ''
      }`,
      options,
      clbk,
    )

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(client.translate({ key: 'slashCommands.issue.Recieved', lng: interaction.user.language }))
          .setDescription(client.translate({ key: 'slashCommands.issue.Thanks', lng: interaction.user.language })),
      ],
      ephemeral: true,
    })
  } catch (error) {
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(client.translate({ key: 'slashCommands.issue.Error', lng: interaction.user.language }))
          .setDescription(client.translate({ key: 'slashCommands.issue.TryAgain', lng: interaction.user.language })),
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
