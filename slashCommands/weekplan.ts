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
  const data = await async.fromURL(pClient.config.calendars[pCourseAndSemester])

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
      value += `\`${moment(weekdayEvent.start).format('HH:mm')} - ${moment(weekdayEvent.end).format(
        'HH:mm',
      )}\` ${_shortenSummary(weekdayEvent.summary)} [[Maps](https://www.google.com/maps/search/KIT+${encodeURIComponent(
        weekdayEvent.location,
      )}/)]`
      if (weekdayEvent.description.indexOf('https://kit-lecture.zoom.us') !== -1) {
        const link_splitter = weekdayEvent.description.split('">')
        value += ` [[Zoom](${link_splitter[link_splitter.length - 1].replace('</a>', '').replaceAll('&nbsp;', '')})]`
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
      if (pCourseAndSemester === 'all') {
        const roleNames = pMessageOrInteraction.member.roles.cache.map(obj => obj.name)
        if (roleNames.indexOf(title.split(' - ')[1].split(' (')[0]) !== -1) relevantEvents.push(event)
      } else {
        relevantEvents.push(event)
      }
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
        if (pCourseAndSemester === 'all') {
          const roleNames = pMessageOrInteraction.member.roles.cache.map(obj => obj.name)
          // In case someone fucked up naming-scheme
          if (roleNames.indexOf(title.split('- ')[1].split(' (')[0]) !== -1) {
            relevantEvents.push(curEvent)
          }
        } else {
          relevantEvents.push(curEvent)
        }
      }
    }
  }
  return { startDate, endDate }
}

exports.run = async client => {
  await postSlashCommand(client)

  client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return
    const COMMAND = interaction.commandName
    if (COMMAND !== 'vorschlag') return
    await respond(interaction, COMMAND, client)
  })
}

async function postSlashCommand(client: any): Promise<void> {
  await client.api.applications(client.user.id).commands.post({
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
  const now = moment()
  const embed = wochenplan(client, interaction, now, 'all')

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  })
}
