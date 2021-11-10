import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../types/customTypes'
const tx2 = require('tx2')

const commandsCounter = tx2.counter({
  name: 'Commands used',
})

exports.run = (client: DiscordClient, message: Message) => {
  if (message.author.bot) return

  // DM handling and forwarding
  if (message.guildId === null) {
    const messagePayload = {
      type: 'USER_DM',
      user: message.author,
      content: message.content,
      sticker: message.stickers.size > 0 ? message.stickers.first() : null,
      attachments: message.attachments.size > 0 ? message.attachments.first().url : null,
    }

    const userMessage = new MessageEmbed()
      .setDescription(
        message.content +
          (messagePayload.sticker !== null
            ? `${`\n${message.content ? 'and' : 'Sent'} a sticker: + **`}${messagePayload.sticker.name}**`
            : ''),
      )
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setImage(messagePayload.attachments)

    try {
      client.users.fetch(client.config.ids.acceptedAdmins.Christoph).then(user => {
        user.send({ embeds: [userMessage] })
      })
      console.log(messagePayload)
    } catch (error) {
      // Throw new Error(error)
    }
  }

  // Command handling
  if (message.content.startsWith(client.config.prefix)) {
    const messageArray = message.content.split(' '),
      args = messageArray.slice(1)
    const commandName = messageArray[0].slice(client.config.prefix.length).toLowerCase()

    const commandfile =
      client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (commandfile === undefined) return
    try {
      message.channel.sendTyping()
      commandfile.run(client, message, args)
      commandsCounter.inc()
      setTimeout(() => message.delete(), 500)
      console.log(`${message.author.username} used ${commandName} ${args.length > 0 ? `with arguments: ${args}` : ''}`)
    } catch (error) {
      throw new Error(error)
    }
  }
}
