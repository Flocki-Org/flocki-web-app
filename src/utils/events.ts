import dayjs, { type Dayjs } from 'dayjs'
import type { Occurrence, PlanItemType, Recurrence, Weekday } from '@/api/events'

export const WEEKDAYS: { code: Weekday; label: string; short: string }[] = [
  { code: 'MO', label: 'Monday', short: 'Mon' },
  { code: 'TU', label: 'Tuesday', short: 'Tue' },
  { code: 'WE', label: 'Wednesday', short: 'Wed' },
  { code: 'TH', label: 'Thursday', short: 'Thu' },
  { code: 'FR', label: 'Friday', short: 'Fri' },
  { code: 'SA', label: 'Saturday', short: 'Sat' },
  { code: 'SU', label: 'Sunday', short: 'Sun' },
]

export const POSITIONS: { value: number; label: string }[] = [
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
  { value: 4, label: '4th' },
  { value: 5, label: '5th' },
  { value: -1, label: 'Last' },
]

export const PLAN_ITEM_TYPES: { value: PlanItemType; label: string; defaultMinutes: number }[] = [
  { value: 'song', label: 'Song', defaultMinutes: 4 },
  { value: 'reading', label: 'Scripture reading', defaultMinutes: 3 },
  { value: 'sermon', label: 'Sermon', defaultMinutes: 30 },
  { value: 'prayer', label: 'Prayer', defaultMinutes: 5 },
  { value: 'communion', label: 'Communion', defaultMinutes: 10 },
  { value: 'offering', label: 'Offering', defaultMinutes: 5 },
  { value: 'notices', label: 'Notices', defaultMinutes: 5 },
  { value: 'baptism', label: 'Baptism / dedication', defaultMinutes: 10 },
  { value: 'custom', label: 'Other item', defaultMinutes: 5 },
]

export const planItemLabel = (type: PlanItemType) =>
  PLAN_ITEM_TYPES.find((entry) => entry.value === type)?.label ?? type

export const isoDate = (value: Dayjs | Date | string) => dayjs(value).format('YYYY-MM-DD')

/** Monday-based weekday code of a date. */
export const weekdayCode = (value: Dayjs | string): Weekday => WEEKDAYS[(dayjs(value).day() + 6) % 7].code

export const weekdayLabel = (code: Weekday) => WEEKDAYS.find((day) => day.code === code)?.label ?? code

/** The nth weekday position of a date in its month: 1 to 5, or -1 when it is also the last. */
export function monthPosition(value: Dayjs | string) {
  const day = dayjs(value)
  const nth = Math.ceil(day.date() / 7)
  const isLast = day.add(7, 'day').month() !== day.month()
  return { nth, isLast }
}

export function formatTime(value?: string | null) {
  if (!value) return ''
  const [hours, minutes] = value.split(':').map(Number)
  const suffix = hours >= 12 ? 'pm' : 'am'
  const hour = hours % 12 || 12
  return `${hour}:${String(minutes).padStart(2, '0')}${suffix}`
}

export function timeRange(event: Pick<Occurrence, 'allDay' | 'startTime' | 'endTime'>) {
  if (event.allDay) return 'All day'
  if (!event.startTime) return ''
  return event.endTime ? `${formatTime(event.startTime)} – ${formatTime(event.endTime)}` : formatTime(event.startTime)
}

export const ordinal = (n: number) => {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'}`
}

const joinWords = (words: string[]) =>
  words.length <= 1 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`

/** Mirrors the API's schedule label so the editor can preview a rule before it is saved. */
export function describeRecurrence(startDate: string, recurrence: Recurrence | null) {
  if (!recurrence) return 'Once-off'
  const interval = recurrence.interval || 1
  const start = dayjs(startDate)
  let label: string
  if (recurrence.frequency === 'weekly') {
    const days = recurrence.weekdays.length ? recurrence.weekdays : [weekdayCode(start)]
    const ordered = WEEKDAYS.filter((day) => days.includes(day.code)).map((day) => day.label)
    label = interval === 1 ? `Weekly on ${joinWords(ordered)}` : `Every ${interval} weeks on ${joinWords(ordered)}`
  } else if (recurrence.frequency === 'monthly') {
    const every = interval === 1 ? 'every month' : `every ${interval} months`
    if (recurrence.weekdays.length) {
      const positions = [...recurrence.positions]
        .sort((a, b) => (a === -1 ? 99 : a) - (b === -1 ? 99 : b))
        .map((value) => (value === -1 ? 'last' : ordinal(value)))
      const days = WEEKDAYS.filter((day) => recurrence.weekdays.includes(day.code)).map((day) => day.label)
      const positionText = joinWords(positions)
      label = `${positionText.charAt(0).toUpperCase()}${positionText.slice(1)} ${joinWords(days)} of ${every}`
    } else {
      label = interval === 1 ? `Monthly on the ${ordinal(start.date())}` : `Every ${interval} months on the ${ordinal(start.date())}`
    }
  } else {
    label = interval === 1 ? `Yearly on ${start.format('D MMMM')}` : `Every ${interval} years on ${start.format('D MMMM')}`
  }
  if (recurrence.until) label += `, until ${dayjs(recurrence.until).format('D MMM YYYY')}`
  return label
}

/** The Monday-first weeks that cover a month. */
export function monthGrid(month: Dayjs) {
  const first = month.startOf('month')
  const last = month.endOf('month')
  const weeks: Dayjs[][] = []
  let cursor = first.subtract((first.day() + 6) % 7, 'day')
  while (!cursor.isAfter(last, 'day')) {
    weeks.push(Array.from({ length: 7 }, (_, index) => cursor.add(index, 'day')))
    cursor = cursor.add(7, 'day')
  }
  return weeks
}

export const startOfWeek = (value: Dayjs) => value.subtract((value.day() + 6) % 7, 'day').startOf('day')

export function groupByDate<T extends { date: string }>(items: T[]) {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const list = groups.get(item.date) ?? []
    list.push(item)
    groups.set(item.date, list)
  }
  return groups
}

export function locationLine(location?: Occurrence['location'] | null) {
  if (!location) return ''
  const address = location.address
  const addressText = address
    ? [[address.streetNumber, address.street].filter(Boolean).join(' '), address.suburb, address.city]
        .filter(Boolean)
        .join(', ')
    : ''
  const parts = [location.venue, location.useChurchAddress ? addressText || 'Church' : addressText]
  return parts.filter(Boolean).join(' · ')
}

export const typeColour = (colour?: string | null) => colour || '#0284c7'

export const occurrenceRoute = (occurrence: Pick<Occurrence, 'seriesId' | 'originalDate'>) => ({
  name: 'event-occurrence',
  params: { seriesId: occurrence.seriesId, date: occurrence.originalDate },
})

export const planRoute = (occurrence: Pick<Occurrence, 'seriesId' | 'originalDate'>) => ({
  name: 'service-plan',
  params: { seriesId: occurrence.seriesId, date: occurrence.originalDate },
})
