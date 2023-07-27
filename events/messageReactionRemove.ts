import { GuildMember, MessageReaction, TextChannel } from 'discord.js'
import tx2 from 'tx2'
import { colors } from '../types/colors'
import { DiscordClient } from '../types/customTypes'

/**
 * All four course module selection channels
 */
const ROLE_REACTION_CHANNELS = [
  '830837597587767306',
  '830884627051839488',
  '831572233301524501',
  '1015754701708480583',
  '831636138808311878',
  '833349893963776030',
  '783449991355170836',
]
/**
 * Channel to send message to, if course module role does not yet exist
 */
const SDADISDIGEN = '827171746364784671'

/**
 * Custom PM2 metric.
 */
const rolesRemovedCounter = tx2.counter('Rolles removed from users')

exports.run = async (client: DiscordClient, reaction: MessageReaction, user: GuildMember) => {
  /**
   * Only react to members joining the ETIT-KIT server.
   */
  if (reaction.message.guild.id !== client.config.ids.serverID) return

  const USER = await reaction.message.guild.members.fetch(user.id)
  if (ROLE_REACTION_CHANNELS.indexOf(reaction.message.channel.id) > -1) {
    try {
      const channel = reaction.message.channel as TextChannel
      /**
       * Message on wich a reaction was added
       */
      const REACRT_MESSAGE = await channel.messages.fetch(reaction.message.id)
      /**
       * Fetch first role that is mentioned in that message
       */
      const role = REACRT_MESSAGE.mentions.roles.first()
      /**
       * If no role is mentioned, send info message
       */
      if (role === undefined) {
        const infoChannel = reaction.message.guild.channels.cache.get(SDADISDIGEN) as TextChannel
        infoChannel.send(`👤❌ <@!${user.id}> hat in <#${channel.id}> **${reaction.message.content}** abgewählt.`)
      } else if (!USER.roles.cache.has(role.name)) {
        /**
         * If user does have the role selected, remove it
         */
        await USER.roles.remove(role, 'Requested by user.')
        console.log(
          // eslint-disable-next-line max-len
          `User update: ${colors.fg.Red}Removed${colors.special.Reset} role ${colors.special.Bright}${role.name}${colors.special.Reset} from ${USER.displayName}`,
        )
        rolesRemovedCounter.inc(1)
      }
    } catch (error) {
      /**
       * Error handling
       */
      console.log(error)
    }
  }
}
