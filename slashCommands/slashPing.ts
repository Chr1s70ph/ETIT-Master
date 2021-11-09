exports.run = async (client: any) => {
  await client.api
    .applications(client.user.id)
    .guilds(client.config.ids.serverID)
    .commands.post({
      data: {
        name: 'ping',
        description: 'Prüft, ob der Bot ordnungsgemäß antwortet',
      },
    })

  client.ws.on('INTERACTION_CREATE', async interaction => {
    // Type 2 interactions are slashcommands
    if (interaction.type !== '2') return

    const command = interaction.data.name.toLowerCase()

    if (command === 'ping') {
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
  })
}
