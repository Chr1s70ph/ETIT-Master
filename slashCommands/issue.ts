import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed } from 'discord.js'
import { DiscordClient } from '../types/customTypes'
const createIssue = require('github-create-issue')
const REPOSITORY = 'Chr1s70ph/ETIT-Master'

export const data = new SlashCommandBuilder()
  .setName('vorschlag')
  .setDescription('Schlage etwas vor!')
  .addStringOption(option => option.setName('vorschlag').setDescription('Mein Vorschlag').setRequired(true))
  .addStringOption(option => option.setName('titel').setDescription('Titel meines Vorschlages'))

exports.respond = async (client: DiscordClient, interaction): Promise<void> => {
  console.log(`User ${interaction.user.username} issued /${interaction.commandName}`)

  const options = {
    token: client.config.github_token,
    body: interaction.options.getString('vorschlag'),
  }

  try {
    createIssue(
      REPOSITORY,
      `${interaction.user.username}'s Vorschlag${
        interaction.options.getString('titel') ? `: ${interaction.options.getString('titel')}` : ''
      }`,
      options,
      clbk,
    )

    await interaction.reply({
      embeds: [
        new MessageEmbed().setTitle('Vorschlag angekommen!').setDescription('Vielen Dank für deinen Vorschlag!'),
      ],
      ephemeral: true,
    })
  } catch (error) {
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle('⚠Fehler')
          .setDescription('Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'),
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
