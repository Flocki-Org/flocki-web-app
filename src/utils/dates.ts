import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

type DateInput = string | number | Date

export function humanize(date: DateInput) {
  return dayjs(date).fromNow(true)
}

export function shortDateTime(date: DateInput) {
  return dayjs(date).format("D MMM 'YY, hh:mma")
}

export function fullDateTime(date: DateInput) {
  return dayjs(date).format('D MMMM YYYY, hh:mma')
}

export function humanDate(date: DateInput) {
  return dayjs(date).format('D MMMM YYYY')
}

export function durationInYearsOrMonths(date: DateInput) {
  const then = dayjs(date)
  const months = dayjs().diff(then, 'month')
  const years = dayjs().diff(then, 'year')

  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'}`
  }

  return `${years} year${years === 1 ? '' : 's'}`
}

export const filters = {
  humanize,
  shortDateTime,
  fullDateTime,
  humanDate,
  durationInYearsOrMonths,
}

export type DateFilters = typeof filters
