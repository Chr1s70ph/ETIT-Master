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
    return client.reply(message, { content: 'You do not have the permissions to perform that command.' })
  }

  let messageContent: string = message.content

  messageContent = messageContent.split('.status')[1]

  const activityName: string = messageContent.split('-')[0]

  presence.activities[0].name = activityName

  getIcon(messageContent)

  if (presence.activities[0].name === ' ' || presence.activities[0].name === '') {
    const defaultPresence = client.config.presence[0]
    return Presence(client, message, defaultPresence)
  } else {
    return Presence(client, message, presence)
  }
}

function getIcon(messageContent: string): void {
  switch (messageContent.split('-')[1]) {
    case 'online': {
      presence.status = 'online'
      break
    }
    case 'dnd': {
      presence.status = 'dnd'
      break
    }
    case 'idle': {
      presence.status = 'idle'
      break
    }
    case 'invisible' || 'offline': {
      presence.status = 'invisible'
      break
    }
    default: {
      presence.status = 'online'
      break
    }
  }
}

function Presence(client: DiscordClient, message: Message, _presence: object): void {
  client.user.setPresence(_presence)
  message.channel.send('👥Präsenz wurde geupdated!')
}
