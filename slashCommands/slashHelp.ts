const fs = require('fs')
const discord = require('discord.js')
const config = require('../private/config.json')

exports.run = async client => {
  const embed = await getCommands()

  await client.api.applications(client.user.id).commands.post({
    data: {
      name: 'help',
      type: 1,
      description: 'hilfe ist hier',
    },
  })

  client.ws.on('INTERACTION_CREATE', async interaction => {
    // Type 2 interactions are slashcommands
    if (interaction.type !== '2') return
    const command = interaction.data.name.toLowerCase()
    if (command === 'help') {
      console.log(`User ${interaction.member.user.username} issued /help`)

      await client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          // Discord.com/developers/docs/interactions/slash-commands#interaction-response-interactionresponsetype
          type: 4,
          data: {
            embeds: [embed.setTimestamp()],
            flags: 64,
          },
        },
      })
    }
  })

  async function getCommands() {
    const commandsEmbed = new discord.MessageEmbed()
      .setColor('#ffa500')
      .setAuthor(
        'Help',
        // eslint-disable-next-line max-len
        'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/google/56/white-question-mark-ornament_2754.png',
      )
      .setTimestamp()
      .setFooter(
        `[ID] ${config.ids.userID.botUserID} \nstarted`,
        'https://image.flaticon.com/icons/png/512/888/888879.png',
      )

    // Get all enteties from folder
    const commandFiles = await fs.promises.readdir('./commands/', null)

    for (const file of commandFiles) {
      const element_in_folder = fs.statSync(`./commands/${file}`)
      if (element_in_folder.isDirectory()) {
        // Check if element in folder is a subfolder
        // eslint-disable-next-line no-await-in-loop
        await addCommandsFromSubFolder(commandsEmbed, file)
      }
    }

    // Return full object with all commands
    return commandsEmbed

    async function addCommandsFromSubFolder(_commandsEmbed, file) {
      const sub_directory = `./commands/${file}/`
      try {
        const files = await fs.promises.readdir(sub_directory)
        let commandsInSubfolder = ' '
        for (const command of files) {
          const slicedFileName = command.split('.ts')[0]
          commandsInSubfolder += `${slicedFileName}\n`
        }
        _commandsEmbed.addFields({
          name: file,
          value: commandsInSubfolder,
          inline: true,
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
}
