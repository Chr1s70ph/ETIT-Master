import { Interaction, MessageEmbed } from 'discord.js'
const createIssue = require('github-create-issue')
const REPOSITORY = 'Chr1s70ph/ETIT-Master'

exports.run = async client => {
  await client.api.applications(client.user.id).commands.post({
    data: {
      name: 'vorschlag',
      description: 'Schlage etwas vor!',
      options: [
        {
          name: 'vorschlag',
          description: 'Mein Vorschlag:',
          type: 3,
          required: true,
        },
        {
          name: 'titel',
          description: 'Mein Vorschlag:',
          type: 3,
          required: false,
        },
      ],
    },
  })

  client.on('interactionCreate', async (interaction: Interaction) => {
    // Type 2 interactions are slashcommands
    if (!interaction.isCommand()) return
    const COMMAND = interaction.commandName
    if (COMMAND !== 'vorschlag') return
    console.log(`User ${interaction.user.username} issued /${COMMAND}`)

    const options = {
      token: client.config.github_token,
      body: interaction.options.getString('vorschlag'),
    }

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
    })
  })
}

function clbk(error: Error, issue: object, info) {
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
