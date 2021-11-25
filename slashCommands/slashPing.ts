import { Interaction } from 'discord.js'

exports.run = async (client: any) => {
  await postSlashCommand(client)

  client.ws.on('INTERACTION_CREATE', async (interaction: Interaction) => {
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
  await client.api.interactions(interaction.id, interaction.token).callback.post({
    data: {
      type: 4,
      data: {
        content: 'pong',
        flags: 64,
      },
    },
  })
}
