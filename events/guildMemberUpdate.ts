/* eslint-disable max-len */
import { EmbedBuilder, GuildMember } from 'discord.js'
import { DiscordClient } from '../types/customTypes'

exports.run = (client: DiscordClient, oldMember: GuildMember, newMember: GuildMember) => {
  /**
   * Fetch roleIDs of member.
   */
  const { newRoleIDs, oldRoleIDs } = getRoleIDs(oldMember, newMember)

  /**
   * Get id of newly added role.
   */
  const addedRole = getDifference(newRoleIDs, oldRoleIDs)

  /**
   * Check if member has new roles.
   */
  if (addedRole[0] === client.config.ids.roleIDs.Ophase) {
    const { memberCourseOfStudies, memberClassificationchannel, memberClassificationLink } = getUserInfo(
      newMember,
      client,
    )

    /**
     * Check if member has a course of studies selected.
     */
    if (memberCourseOfStudies !== undefined) {
      /**
       * Personalized Embed.
       */
      const ophaseInfo = new EmbedBuilder()
        .setTitle(`🗲 Personalisierung 🗲`)
        .setColor('#FFDA00')
        .setAuthor({ name: client.user.tag, iconURL: newMember.guild.iconURL() })
        .setThumbnail(client.user.avatarURL())
        .setDescription(
          `Meine Spione haben mir erzählt, dass du \`${memberCourseOfStudies}\` bist.
					In [<#${memberClassificationchannel}>](${memberClassificationLink}) kannst du dich weiter einteilen, und die Fächer für dein Semester auswählen.`,
        )

      try {
        /**
         * Send personalized embed to member.
         */
        console.log(`Sent ${newMember.user.username} personalization message`)
        return newMember.send({ embeds: [ophaseInfo] })
      } catch (error) {
        /**
         * Handle Errors.
         */
        throw new Error(error)
      }
    } else {
      return 0
    }
  } else {
    return 0
  }
}

/**
 * Get two arrays with Role-IDs.
 * {@link newRoleIDs} are the Role-IDs after the member has been updated.
 * {@link oldRoleIDs} are the Role-IDs after the member has been updated.
 * @param  {GuildMember} oldMember GuildMember before user has been updated
 * @param  {GuildMember} newMember GuildMember after user has been updated
 * @returns {any[]}
 */
function getRoleIDs(oldMember: GuildMember, newMember: GuildMember): { newRoleIDs: any[]; oldRoleIDs: any[] } {
  const oldRoleIDs = []
  oldMember.roles.cache.each(role => {
    oldRoleIDs.push(role.id)
  })
  const newRoleIDs = []
  newMember.roles.cache.each(role => {
    newRoleIDs.push(role.id)
  })
  return { newRoleIDs, oldRoleIDs }
}

/**
 * Get difference of 2 Arrays.
 * @param {string[]} newRoleIDs GuildMember before user has been updated
 * @param {string[]} oldRoleIDs GuildMember after user has been updated
 * @returns {string[]}
 */
function getDifference(newRoleIDs: any[], oldRoleIDs: any[]): string[] {
  return newRoleIDs.filter(item => oldRoleIDs.indexOf(item) < 0)
}

/**
 *
 * @param {GuildMember} member GuildMember of whom to get information about
 * @param {DiscordClient} client Bot-Client
 * @returns {userInfo}
 */
function getUserInfo(member: GuildMember, client: DiscordClient): userInfo {
  const memberCourseOfStudies = member.roles.cache.has(client.config.ids.roleIDs['ETIT Bachelorstudent'])
    ? 'ETIT Bachelorstudent'
    : member.roles.cache.has(client.config.ids.roleIDs['MIT Bachelorstudent'])
    ? 'MIT Bachelorstudent'
    : undefined

  /**
   * Get right classification channel based on role.
   */
  const memberClassificationchannel = member.roles.cache.has(client.config.ids.roleIDs['ETIT Bachelorstudent'])
    ? client.config.ids.channelIDs.ETITPersonalization
    : member.roles.cache.has(client.config.ids.roleIDs['MIT Bachelorstudent'])
    ? client.config.ids.channelIDs.MITPersonalization
    : undefined

  /**
   * Get link to message in memberClassificationchannel.
   */
  const memberClassificationLink = member.roles.cache.has(client.config.ids.roleIDs['ETIT Bachelorstudent'])
    ? client.config.ids.einteilung.ETITersti
    : member.roles.cache.has(client.config.ids.roleIDs['MIT Bachelorstudent'])
    ? client.config.ids.einteilung.MITersti
    : undefined

  return { memberCourseOfStudies, memberClassificationchannel, memberClassificationLink }
}

/**
 * Interface for userInfo object.
 */
interface userInfo {
  memberCourseOfStudies: any
  memberClassificationchannel: any
  memberClassificationLink: any
}
