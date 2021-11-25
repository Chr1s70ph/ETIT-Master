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
    dmForwarding(message, client)
  }

  // Command handling
  if (message.content.startsWith(client.config.prefix)) {
    const { commandfile, args, commandName } = getCommandData(message, client)

    if (commandfile === undefined) return
    executeCommand(message, commandfile, client, args, commandName)
  }
}

function dmForwarding(message: Message<boolean>, client: DiscordClient): void {
  const messagePayload = {
    type: 'USER_DM',
    user: message.author,
    content: message.content,
    sticker: message.stickers.size > 0 ? message.stickers.first() : null,
    attachments: message.attachments.size > 0 ? message.attachments.first().url : null,
  }

  const userMessage = userMessageEmbed(message, messagePayload)

  try {
    client.users.fetch(client.config.ids.acceptedAdmins.Christoph).then(user => {
      user.send({ embeds: [userMessage] })
    })
    console.log(messagePayload)
  } catch (error) {
    throw new Error(error)
  }
}

function userMessageEmbed(message: Message<boolean>, messagePayload) {
  return new MessageEmbed()
    .setDescription(
      message.content +
        (messagePayload.sticker !== null
          ? `${`\n${message.content ? 'and' : 'Sent'} a sticker: + **`}${messagePayload.sticker.name}**`
          : ''),
    )
    .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() })
    .setImage(messagePayload.attachments)
}

function getCommandData(
  message: Message<boolean>,
  client: DiscordClient,
): { commandfile: any; args: string[]; commandName: string } {
  const messageArray = message.content.split(' '),
    args = messageArray.slice(1)
  const commandName = messageArray[0].slice(client.config.prefix.length).toLowerCase()

  const commandfile =
    client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
  return { commandfile, args, commandName }
}

function executeCommand(
  message: Message<boolean>,
  commandfile: any,
  client: DiscordClient,
  args: string[],
  commandName: string,
): void {
  try {
    message.channel.sendTyping()
    commandfile.run(client, message, args)?.then(msg => msg?.delete())
    commandsCounter.inc()
    console.log(`${message.author.username} used ${commandName} ${args.length > 0 ? `with arguments: ${args}` : ''}`)
  } catch (error) {
    throw new Error(error)
  }
}
