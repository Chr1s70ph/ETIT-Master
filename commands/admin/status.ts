import { Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
exports.name = 'status'

exports.description = 'Setzt den Status des Bottes'

exports.usage = 'status {STATUS} {ICON}'

exports.example = `status Bitte nicht stören -dnd\n
status `

const presence = {
  activities: [
    {
      name: '',
      type: 'PLAYING',
    },
  ],
  status: '',
}

exports.presence = presence

exports.run = (client: DiscordClient, message: Message) => {
  if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id)) {
    return client.commandReplyPromise(message, { content: 'You do not have the permissions to perform that command.' })
  }

  let messageContent: string = message.content

  messageContent = messageContent.split('.status')[1]

  const activityName: string = messageContent.split('-')[0]
  console.log(presence)

  presence.activities[0].name = activityName

  const icon: string = messageContent.split('-')[1]
  if (icon) {
    if (icon === 'online') {
      presence.status = 'online'
    } else if (icon === 'dnd') {
      presence.status = 'dnd'
    } else if (icon === 'idle') {
      presence.status = 'idle'
    } else if (icon === 'invisible' || icon === 'offline') {
      presence.status = 'invisible'
    } else {
      message.channel.send('Please enter a valid status type.')
    }
  } else {
    presence.status = 'online'
  }

  if (presence.activities[0].name === ' ' || presence.activities[0].name === '') {
    const defaultPresence = client.config.presence[0]
    return Presence(client, message, defaultPresence)
  } else {
    return Presence(client, message, presence)
  }
}

function Presence(client: DiscordClient, message: Message, _presence: object) {
  client.user.setPresence(_presence)
  message.channel.send('👥Präsenz wurde geupdated!')
}
