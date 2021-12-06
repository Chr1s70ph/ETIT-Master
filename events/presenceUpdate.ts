import { MessageEmbed, TextChannel } from 'discord.js'
import { Presence } from 'discord.js/typings/index.js'
import { connect, start, stop } from 'pm2'
import { DiscordClient } from '../types/customTypes'

exports.run = (client: DiscordClient, oldPresence: Presence, newPresence: Presence) => {
  /**
   * Check for specific user ID.
   */
  if (newPresence.member === client.config.ids.userID.etitChef) {
    try {
      if (oldPresence?.status !== newPresence?.status) {
        /**
         * Emergency Embed in case ETIT-Chef is offline
         */
        const emergency = new MessageEmbed()
          .setColor('#8B0000')
          .setTitle('Der ETIT-Chef ist Offline!!')
          .setAuthor({ name: 'Offline Detector', iconURL: client.user.avatarURL() })
          .setThumbnail('https://wiki.jat-online.de/lib/exe/fetch.php?cache=&media=emoticons:lupe.png')
          .addFields({
            name: 'Leonard eile zur Hilfe!',
            value: 'Wir brauchen dich!',
          })

        if (newPresence.status === 'offline') {
          /**
           * This is to start an instance of another bot, on the server. This only triggers, when that bot is offline.
           */
          offlineHandle(client, emergency)
        } else if (oldPresence.status === 'offline' && newPresence.status === 'online') {
          /**
           * This is to stop an instance of another bot, on the server.
           * This only triggers, when that bot comes online again.
           */
          onlineHandle()
        } else if (newPresence.status === 'online') {
          return
        }
      }
    } catch (error) {
      /**
       * Error handling.
       */
      throw new Error(error)
    }
  }
}

/**
 * Start a backup instance of [ETIT-Chef](https://github.com/itzFlubby/ETIT-Chef)
 * @param  {DiscordClient} client Bot-Client
 * @param  {MessageEmbed} emergencyEmbed Embed to send.
 * @returns {void}
 */
function offlineHandle(client: DiscordClient, emergencyEmbed: MessageEmbed): void {
  /**
   * Fetch channel to send {@link emergencyEmbed} to.
   */
  const channel = client.channels.cache.find(
    _channel => _channel.id === client.config.ids.channelIDs.dev.botTestLobby,
  ) as TextChannel

  /**
   * Send {@link emergencyEmbed} and ping Leonard.
   */
  channel.send({
    content: `<@${client.config.ids.userID.leonard}>`,
    embeds: [emergencyEmbed.setTimestamp()],
  })

  connect(err => {
    if (err) {
      console.error(err)
      process.exit(2)
    }

    start(
      {
        name: 'ETIT-Chef',
      },
      null,
    )
  })
}

/**
 * Stop a backup instance of [ETIT-Chef](https://github.com/itzFlubby/ETIT-Chef)
 * @returns {void}
 */
function onlineHandle(): void {
  connect(err => {
    if (err) {
      console.error(err)
      process.exit(2)
    }

    stop('ETIT-Chef', null)
  })
}
