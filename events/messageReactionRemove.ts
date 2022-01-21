import { GuildMember, MessageReaction, TextChannel } from 'discord.js'
import { DiscordClient } from '../types/customTypes'

/**
 * Channel ID of Coursedegree selection and Freetime Role selection
 */
const COURSEDEGREE_FREETIME_SELECTION = ['830837597587767306', '783449991355170836']
/**
 * All four course module selection channels
 */
const COURSE_SELECTIONS = ['830884627051839488', '831572233301524501', '831636138808311878', '833349893963776030']
/**
 * Channel to send message to, if course module role does not yet exist
 */
const SDADISDIGEN = '827171746364784671'

exports.run = async (client: DiscordClient, reaction: MessageReaction, user: GuildMember) => {
  const USER = await reaction.message.guild.members.fetch(user.id)
  /**
   * Bachelor selection
   */
  if (COURSEDEGREE_FREETIME_SELECTION.indexOf(reaction.message.channel.id) > -1) {
    /**
     * Message on wich a reaction was added
     */
    const REACRT_MESSAGE = await reaction.message.channel.messages.fetch(reaction.message.id)

    /**
     * Message on wich a reaction was added
     * Split into an array to handle lines
     */
    const REACRT_MESSAGE_ARRAY = await reaction.message.channel.messages
      .fetch(reaction.message.id)
      .then(msg => msg.content.split('\n'))
    /**
     * Loop through lines and remove Roles
     */
    for (const line in REACRT_MESSAGE_ARRAY) {
      /**
       * Check if line contains either the name of the emoji (guild Emoji)
       * Or if it contains unicode emoji data
       */
      if (
        REACRT_MESSAGE_ARRAY[line].includes(reaction.emoji.toString()) ||
        REACRT_MESSAGE_ARRAY[line].includes(`:${reaction.emoji.name}:`)
      ) {
        /**
         * Fetch role selected by user
         */
        const role = REACRT_MESSAGE.mentions.roles.first()
        if (!USER.roles.cache.has(role?.name) && role !== undefined) {
          /**
           * If user does not yet have the role selected, remove it
           */
          // eslint-disable-next-line no-await-in-loop
          await USER.roles.remove(role, 'Requested by user.')
          console.log(`Removed Role:${role.name} from ${USER.displayName}`)
        } else {
          /**
           * Send message, that role could not be found
           */
          console.log(`Role(${reaction.emoji.name}) selected by ${USER.displayName} can not be found `)
        }
      }
    }
  } else if (COURSE_SELECTIONS.indexOf(reaction.message.channel.id) > -1) {
    try {
      /**
       * Message on wich a reaction was added
       */
      const REACRT_MESSAGE = await reaction.message.channel.messages.fetch(reaction.message.id)
      /**
       * Fetch first role that is mentioned in that message
       */
      const role = REACRT_MESSAGE.mentions.roles.first()
      /**
       * If no role is mentioned, send info message
       */
      if (role === undefined) {
        const infoChannel = reaction.message.guild.channels.cache.get(SDADISDIGEN) as TextChannel
        infoChannel.send(
          `👤❌ <@!${user.id}> hat in <#${reaction.message.channel.id}> **${reaction.message.content}** abgewählt.`,
        )
      } else if (!USER.roles.cache.has(role.name)) {
        /**
         * If user does have the role selected, remove it
         */
        await USER.roles.remove(role, 'Requested by user.')
        console.log(`Removed Role:${role.name} from ${USER.displayName}`)
      }
    } catch (error) {
      /**
       * Error handling
       */
      console.log(error)
    }
  }
}
