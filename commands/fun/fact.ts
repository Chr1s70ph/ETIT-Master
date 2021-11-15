import { readFile } from 'fs'
import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

const FACTS_FILE = './data/facts.txt'

exports.name = 'fact'

exports.description = 'Willst du Fakten? Dann bist du hier genau richtig.'

exports.usage = 'fact'

exports.run = (client: DiscordClient, message: Message) => {
  readFile(FACTS_FILE, 'utf-8', (err, data) => {
    if (err) {
      throw err
    }
    data += ''
    const lines = data.split('\n')

    // Choose one of the lines...
    const line = lines[Math.floor(Math.random() * lines.length)]

    client.send(message, {
      embeds: [
        new MessageEmbed()
          .setTitle('🧠Fact')
          .setDescription(line)
          .setFooter(message.author.tag, message.author.avatarURL({ dynamic: true })),
      ],
    })
  })
}
