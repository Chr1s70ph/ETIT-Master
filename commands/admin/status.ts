import { Message, PresenceData as setPresenceData, PresenceStatusData } from 'discord.js'
import { DiscordClient, DiscordMessage } from '../../types/customTypes'
exports.name = 'status'

exports.description = 'Setzt den Status des Bottes'

exports.usage = 'status {STATUS} {ICON}'

exports.example = `status Bitte nicht stören -dnd\n
status `

/**
 * Presence object to use for custom presences.
 */
const presence: setPresenceData = {
  activities: [
    {
      name: '',
      /**
       * 0 represents playing a game
       */
      type: 0,
    },
  ],
  status: 'online',
}

exports.presence = presence

exports.run = (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Check if user has the correct rights to execute the command.
   */
  if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id)) {
    return client.reply(message, {
      content: client.translate({ key: 'commands.admin.missingPermission', lng: message.author.language }),
    })
  }

  /**
   * Content of message.
   */
  let messageContent: string = message.content

  messageContent = messageContent.split(`${client.config.prefix}status`)[1]

  /**
   * Set activity name.
   */
  presence.activities[0].name = messageContent.split('-')[0]

  /**
   * Set presence status.
   */
  presence.status = getPresenceStatusData(messageContent)

  /**
   * Only set custom presence if defined.
   * Otherwise use default presence from config.
   */
  return presence.activities[0].name === ' ' || presence.activities[0].name === ''
    ? setPresenceData(client, message, client.config.presence[0])
    : setPresenceData(client, message, presence)
}

/**
 * Fetches {@link getPresenceStatusData}
 * @param {string} messageContent {@link Message.content}
 * @returns {getPresenceStatusData} {@link getPresenceStatusData}
 */
function getPresenceStatusData(messageContent: string): PresenceStatusData {
  switch (messageContent.split('-')[1]) {
    case 'online': {
      return 'online'
    }
    case 'dnd': {
      return 'dnd'
    }
    case 'idle': {
      return 'idle'
    }
    case 'invisible' || 'offline': {
      return 'invisible'
    }
    default: {
      return 'online'
    }
  }
}

/**
 * @param {DiscordClient} client {@link DiscordClient}
 * @param {DiscordMessage} message Command {@link Message}
 * @param {setPresenceData} _presence {@link setPresenceData}
 * @returns {Promise<Message<boolean>>}
 */
function setPresenceData(
  client: DiscordClient,
  message: DiscordMessage,
  _presence: setPresenceData,
): Promise<Message<boolean>> {
  client.user.setPresence(_presence)
  return client.send(message, {
    content: client.translate({ key: 'commands.admin.status', lng: message.author.language }),
  })
}
