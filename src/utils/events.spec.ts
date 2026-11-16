import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { draftPayload, itemPayload } from '@/api/events'
import { describeRecurrence, formatTime, monthGrid, monthPosition, timeRange, weekdayCode } from './events'

describe('event helpers', () => {
  it('describes schedules the way the API does', () => {
    expect(describeRecurrence('2026-11-01', null)).toBe('Once-off')
    expect(describeRecurrence('2026-11-01', { frequency: 'weekly', interval: 1, weekdays: ['SU'], positions: [] })).toBe(
      'Weekly on Sunday',
    )
    expect(describeRecurrence('2026-11-03', { frequency: 'weekly', interval: 2, weekdays: [], positions: [] })).toBe(
      'Every 2 weeks on Tuesday',
    )
    expect(
      describeRecurrence('2026-11-02', { frequency: 'monthly', interval: 1, weekdays: ['MO'], positions: [3, 1] }),
    ).toBe('1st and 3rd Monday of every month')
    expect(
      describeRecurrence('2026-11-27', { frequency: 'monthly', interval: 1, weekdays: ['FR'], positions: [-1] }),
    ).toBe('Last Friday of every month')
    expect(describeRecurrence('2026-11-15', { frequency: 'monthly', interval: 1, weekdays: [], positions: [] })).toBe(
      'Monthly on the 15th',
    )
    expect(
      describeRecurrence('2026-12-25', { frequency: 'yearly', interval: 1, weekdays: [], positions: [], until: '2028-01-01' }),
    ).toBe('Yearly on 25 December, until 1 Jan 2028')
  })

  it('formats times and ranges', () => {
    expect(formatTime('09:00:00')).toBe('9:00am')
    expect(formatTime('18:30:00')).toBe('6:30pm')
    expect(timeRange({ allDay: false, startTime: '09:00:00', endTime: '10:30:00' })).toBe('9:00am – 10:30am')
    expect(timeRange({ allDay: true, startTime: null, endTime: null })).toBe('All day')
  })

  it('works out weekday codes and month positions', () => {
    expect(weekdayCode('2026-11-16')).toBe('MO')
    expect(weekdayCode('2026-11-15')).toBe('SU')
    expect(monthPosition('2026-11-27')).toEqual({ nth: 4, isLast: true })
    expect(monthPosition('2026-11-02')).toEqual({ nth: 1, isLast: false })
  })

  it('builds Monday-first month grids', () => {
    const weeks = monthGrid(dayjs('2026-11-01'))
    expect(weeks).toHaveLength(6)
    expect(weeks[0][0].format('YYYY-MM-DD')).toBe('2026-10-26')
    expect(weeks[5][6].format('YYYY-MM-DD')).toBe('2026-12-06')
    expect(monthGrid(dayjs('2027-02-01'))).toHaveLength(4)
  })

  it('builds request payloads without stray fields', () => {
    expect(
      draftPayload({
        eventTypeId: 1,
        title: ' Morning Service ',
        startDate: '2026-11-01',
        startTime: '09:00',
        endTime: '',
        allDay: false,
        location: { useChurchAddress: true, addressId: 4, venue: '' },
        recurrence: { frequency: 'weekly', interval: 1, weekdays: ['SU'], positions: [1] },
      }),
    ).toMatchObject({
      title: 'Morning Service',
      endTime: null,
      location: { useChurchAddress: true, addressId: null, venue: null },
      recurrence: { frequency: 'weekly', weekdays: ['SU'], positions: [] },
    })
    expect(itemPayload({ itemType: 'reading', personId: 3, personName: 'Guest', durationMinutes: 0 })).toMatchObject({
      personId: 3,
      personName: null,
      durationMinutes: 0,
    })
  })
})
