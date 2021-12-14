import { Interaction, Message, MessageEmbed } from 'discord.js'
import moment from 'moment-timezone'
import { async } from 'node-ical'
import { DiscordClient } from '../types/customTypes'

exports.name = 'wochenplan'

exports.description = '️Zeigt den Wochenplan an.'

exports.usage = `wochenplan {TAG}`

class Abbreviation {
  constructor(pEmoji, pValue) {
    const emoji = pEmoji
    const value = pValue
  }
}

const replacementDict = {
  'Höhere Mathematik': new Abbreviation(':chart_with_upwards_trend:', 'HM'),
  'Hoehere Mathematik': new Abbreviation(':chart_with_upwards_trend:', 'HM'),
  'Inverted Classroom': new Abbreviation('', 'IC'),
  'Elektronische Schaltungen': new Abbreviation(':radio:', 'ES'),
  'Elektromagnetische Felder': new Abbreviation(':magnet:', 'EMF'),
  'Elektromagnetische Wellen': new Abbreviation(':magnet:', 'EMW'),
  'Komplexe Analysis und Integraltransformationen': new Abbreviation(':triangular_ruler:', 'KAI'),
  Informationstechnik: new Abbreviation(':computer:', 'IT'),
  'Optik und Festkörperelektronik': new Abbreviation(':eyes:', 'OFE'),
  'Optik und Festkoerperelektronik': new Abbreviation(':eyes:', 'OFE'),
  'Grundlagen der Hochfrequenztechnik': new Abbreviation(':satellite:', 'GHF'),
  Maschinenkonstruktionslehre: new Abbreviation(':gear:', 'MKL'),
  'Technische Mechanik': new Abbreviation(':wrench:', 'TM'),
  Elektroenergiesysteme: new Abbreviation(':battery:', 'EES'),
  'Signale und Systeme': new Abbreviation(':signal_strength:', 'SUS'),
  Wahrscheinlichkeitstheorie: new Abbreviation(':game_die:', 'WT'),
  'Elektrische Maschinen und Stromrichter': new Abbreviation(':zap:', 'EMS'),
  Nachrichtentechnik: new Abbreviation(':satellite:', 'NT'),
  'Systemdynamik und Regelungstechnik': new Abbreviation(':chart_with_downwards_trend:', 'SRT'),
  'Bauelemente der Elektrotechnik': new Abbreviation(':electric_plug:', 'BE'),
  Halbleiterbauelemente: new Abbreviation(':electric_plug:', 'HBE'),
  'Passive Bauelemente': new Abbreviation(':electric_plug:', 'PE'),
}

function _shortenSummary(pEventSummary) {
  for (const replaceCheck of Object.keys(replacementDict)) {
    if (pEventSummary.indexOf(replaceCheck) !== -1) {
      return `${replacementDict[replaceCheck].emoji} ${pEventSummary.replace(
        replaceCheck,
        replacementDict[replaceCheck].value,
      )}`.replace('Vorlesung', 'VL')
    }
  }
  return pEventSummary
}

async function wochenplan(pClient: DiscordClient, pMessageOrInteraction, pNow, pCourseAndSemester) {
  let data = {}
  for (const entry in pClient.config.calendars) {
    // eslint-disable-next-line no-await-in-loop
    data = { ...data, ...(await async.fromURL(pClient.config.calendars[entry])) }
  }

  const relevantEvents = []
  const curWeekday = pNow.getDay() === 0 ? 6 : pNow.getDay() - 1
  const startOfWeek = new Date(pNow.setDate(pNow.getDate() - curWeekday))
  startOfWeek.setHours(0, 0, 0)

  const rangeStart = moment(startOfWeek)
  const rangeEnd = rangeStart.clone().add(7, 'days')

  filterEvents(data, rangeStart, rangeEnd, pCourseAndSemester, pMessageOrInteraction, relevantEvents)

  const embed = new MessageEmbed()
    .setAuthor(`🗓️ Wochenplan für ${pMessageOrInteraction.member.user.username}`)
    .setDescription(`Woche vom ${moment(startOfWeek).format('DD.MM.yyyy')}`)

  const weekdayItems = {}

  for (const relevantEvent of relevantEvents) {
    if (typeof relevantEvent.start.tz === 'undefined') {
      const tzOffset = moment().tz('Europe/Berlin').utcOffset()
      relevantEvent.start.setMinutes(relevantEvent.start.getMinutes() + tzOffset)
      relevantEvent.end.setMinutes(relevantEvent.end.getMinutes() + tzOffset)
    }

    if (!weekdayItems[moment(relevantEvent.start).days()]) {
      weekdayItems[moment(relevantEvent.start).days()] = []
    }
    weekdayItems[moment(relevantEvent.start).days()].push(relevantEvent)
  }

  moment.locale('de')

  for (const weekdayKey of Object.keys(weekdayItems)) {
    let weekdayItem = weekdayItems[weekdayKey]
    weekdayItem = weekdayItem.sort((a, b) => moment(a.start).hours() - moment(b.start).hours())

    const name = moment(
      new Date(
        `${startOfWeek.getFullYear()}-${(startOfWeek.getMonth() + 1).toString().padStart(2, '0')}-${(
          startOfWeek.getDate() +
          parseInt(weekdayKey) -
          1
        )
          .toString()
          .padStart(2, '0')}T00:00:00`,
      ),
    ).format('DD.MM.yyyy (dddd)')
    let value = ''

    for (const weekdayEvent of weekdayItem) {
      value += `\`${moment(weekdayEvent.start).format('HH:mm')} - ${moment(weekdayEvent.end).format('HH:mm')}\` ${
        weekdayEvent.summary
      } [[Maps](https://www.google.com/maps/search/KIT+${encodeURIComponent(weekdayEvent.location)}/)]`
      if (weekdayEvent.description.indexOf('https://kit-lecture.zoom.us') !== -1) {
        value += ` [[Zoom](${extractZoomLinks(weekdayEvent.description)})]`
      }
      value += '\n'
    }
    embed.addFields({ name: name, value: value, inline: false })
  }

  return embed
}

function filterEvents(
  data: any,
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment,
  pCourseAndSemester: any,
  pMessageOrInteraction: any,
  relevantEvents: any[],
) {
  for (const i in data) {
    const event = data[i]
    if (data[i].type === 'VEVENT') {
      const title = event.summary
      const startDate = moment(event.start)
      const endDate = moment(event.end)
      const duration = parseInt(endDate.format('x')) - parseInt(startDate.format('x'))
      secondFIlter(
        event,
        startDate,
        rangeStart,
        rangeEnd,
        pCourseAndSemester,
        pMessageOrInteraction,
        title,
        relevantEvents,
        duration,
        endDate,
      )
    }
  }
}

function secondFIlter(
  event: any,
  startDate: any,
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment,
  pCourseAndSemester: any,
  pMessageOrInteraction: any,
  title: any,
  relevantEvents: any[],
  duration: number,
  endDate: any,
) {
  if (typeof event.rrule === 'undefined') {
    if (startDate.isBetween(rangeStart, rangeEnd)) {
      pushToWeeksEvents(pMessageOrInteraction, event, relevantEvents)
    }
  } else {
    const dates = event.rrule.between(rangeStart.toDate(), rangeEnd.toDate(), true)

    if (event.recurrences !== undefined) {
      for (const recurrence in event.recurrences) {
        if (moment(new Date(recurrence)).isBetween(rangeStart, rangeEnd) !== true) {
          dates.push(new Date(recurrence))
        }
      }
    }

    for (const date of dates) {
      let curEvent = event
      let relevantRecurrence = true
      let curDuration = duration

      startDate = moment(date)

      const dateLookupKey = date.toISOString().substring(0, 10)

      if (curEvent.recurrences !== undefined && curEvent.recurrences[dateLookupKey] !== undefined) {
        curEvent = curEvent.recurrences[dateLookupKey]
        startDate = moment(curEvent.start)
        curDuration = parseInt(moment(curEvent.end).format('x')) - parseInt(startDate.format('x'))
      } else if (curEvent.exdate !== undefined && curEvent.exdate[dateLookupKey] !== undefined) {
        relevantRecurrence = false
      }

      endDate = moment(parseInt(startDate.format('x')) + curDuration, 'x')

      if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
        relevantRecurrence = false
      }

      if (relevantRecurrence === true) {
        pushToWeeksEvents(pMessageOrInteraction, event, relevantEvents)
      }
    }
  }
}

function pushToWeeksEvents(interaction, event, relevantEvents) {
  const roles = interaction.member.roles.cache.map(role => role)
  for (const role in roles) {
    const searchQuery = event.summary.split('-')[1].split('(')[0].toLowerCase()
    if (roles[role].name.toLowerCase().trim() === searchQuery.toLowerCase().trim()) {
      relevantEvents.push(event)
    }
  }
}

exports.run = async client => {
  await postSlashCommand(client)

  client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return
    const COMMAND = interaction.commandName
    if (COMMAND !== 'wochenplan') return
    await respond(interaction, COMMAND, client)
  })
}

async function postSlashCommand(client: any): Promise<void> {
  await client.api
    .applications(client.user.id)
    .guilds('757981349402378331')
    .commands.post({
      data: {
        name: 'wochenplan',
        description: 'Zeigt den Wochenplan an.',
        options: [
          {
            name: 'datum',
            description: 'Das Datum, das angezeigt werden soll. Format: TT.MM.YYYY',
            type: 3,
            required: false,
          },
        ],
      },
    })
}

async function respond(interaction, COMMAND: string, client: any): Promise<void> {
  console.log(`User ${interaction.user.username} issued /${COMMAND}`)
  const now = new Date()
  const embed = wochenplan(client, interaction, now, 'all')

  await interaction.reply({
    embeds: [await embed],
    ephemeral: true,
  })
}

/**
 * Extracts the zoom Links from HTML tag
 * if the HTML tag contains "#success" it cuts the string before that string, to make the link automatically open zoom
 * @param {string} eventLinkString string to extract link from
 * @returns {string} well formed url
 */
function extractZoomLinks(eventLinkString: string): string {
  if (eventLinkString.length === 0) return undefined

  /**
   * Extract link from href tag.
   */
  eventLinkString = eventLinkString.includes('<a href=')
    ? eventLinkString.split('<a href=')[1].split('>')[0]
    : eventLinkString

  /**
   * Strip all html tags and encode as URI.
   */
  const link = eventLinkString.replace(/(<.*?>)/g, '')

  /**
   * Remove "#success" string, to automatically open zoom.
   */
  return link.includes('#success') ? link.split('#success')[0] : link.includes('id=') ? link.split('id=')[0] : link
}
