import { Interaction } from 'discord.js'

exports.run = async (client: any) => {
  await postSlashCommand(client)

  client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return
    const COMMAND = interaction.commandName
    if (COMMAND !== 'ping') return
    await respond(client, interaction)
  })
}

async function postSlashCommand(client: any): Promise<void> {
  await client.api.applications(client.user.id).commands.post({
    data: {
      name: 'ping',
      description: 'Prüft, ob der Bot ordnungsgemäß antwortet',
    },
  })
}

async function respond(client: any, interaction: any): Promise<void> {
  console.log(`User ${interaction.user.username} issued /ping`)
  await interaction.reply({ content: 'pong', ephemeral: true })
}
