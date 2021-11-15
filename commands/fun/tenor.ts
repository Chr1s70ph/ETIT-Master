import { MessageEmbed, Message, MessageMentions } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'tenor'

exports.description = 'send gifs'

exports.usage = `tenor <searchQuery>`

exports.aliases = ['gif']

exports.run = (client: DiscordClient, message: Message, args: string[]) => {
  const embed = new MessageEmbed()
    .setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
    .setColor('RANDOM')

  const userPing = args.find(value => MessageMentions.USERS_PATTERN.test(value))

  args = removeMatching(args, MessageMentions.USERS_PATTERN)

  let searchQuery = ''
  for (const word in args) {
    searchQuery = `${searchQuery + args[word]} `
  }

  if (searchQuery.length === 0) {
    return client.commandSendPromise(message, { content: 'Bitte gebe einen suchwort an!' })
  }

  const Tenor = require('tenorjs').client(client.config.tenor)

  return Tenor.Search.Random(searchQuery, '1').then(Results => {
    if (Results.length === 0) {
      embed.setDescription(`<@${message.author.id}> Es konnten keine Gifs gefunden werden für: '${searchQuery}'`)
      return client.commandSendPromise(message, { embeds: [embed] })
    }
    Results.forEach(Post => {
      const gifUrl = Post.media.find(element => Object.prototype.hasOwnProperty.call(element, 'gif')).gif.url
      embed.setImage(gifUrl)
    })
    return client.commandSendPromise(message, {
      content: userPing,
      embeds: [embed],
    })
  })
}

// https://stackoverflow.com/a/3661083/10926046
function removeMatching(originalArray: string[], regex: RegExp) {
  let j = 0
  while (j < originalArray.length) {
    if (regex.test(originalArray[j])) originalArray.slice(j, 1)
    else j++
  }
  return originalArray
}
