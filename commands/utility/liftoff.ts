import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
exports.name = 'liftoff'

exports.description = 'Liftoff celebration'

exports.usage = 'liftoff'

exports.run = (client: DiscordClient, message: Message) =>
  client.commandSendPromise(message, {
    embeds: [
      new MessageEmbed()
        .setTitle('Hurraaa 🚀🚀')
        .setFooter(message.author.tag, message.author.avatarURL({ dynamic: true })),
    ],
  })
