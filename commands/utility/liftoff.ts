import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
exports.name = 'liftoff'

exports.description = 'Liftoff celebration'

exports.usage = 'liftoff'

exports.run = async (client: DiscordClient, message: Message) => {
  await message.channel.send({
    embeds: [
      new MessageEmbed()
        .setTitle('Hurraaa 🚀🚀')
        .setFooter(message.author.tag, message.author.avatarURL({ dynamic: true })),
    ],
  })
}
