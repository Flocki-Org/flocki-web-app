import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { durationInYearsOrMonths, fullDateTime, humanDate, humanize, shortDateTime } from './dates'

describe('date filters', () => {
  const calendarDate = '2020-01-15T00:00:00'

  it('keeps the calendar formats the people screens already show', () => {
    expect(humanDate(calendarDate)).toBe('15 January 2020')
    expect(shortDateTime(calendarDate)).toBe("15 Jan '20, 12:00am")
    expect(fullDateTime(calendarDate)).toBe('15 January 2020, 12:00am')
  })

  it('counts whole months until a date is a year old', () => {
    const twoMonthsAgo = dayjs().subtract(2, 'month').format('YYYY-MM-DD')
    expect(durationInYearsOrMonths(twoMonthsAgo)).toBe('2 months')
  })

  it('counts years after that, without an extra ago suffix', () => {
    expect(durationInYearsOrMonths('2000-01-01T00:00:00')).toMatch(/^\d+ years$/)
    expect(humanize('2000-01-01T00:00:00')).not.toMatch(/ago/)
  })
})
