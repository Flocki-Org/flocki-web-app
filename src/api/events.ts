import { axios } from '@/axios'

export type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU'
export type Frequency = 'weekly' | 'monthly' | 'yearly'
export type EditScope = 'this' | 'following' | 'all'
export type PlanState = 'not_started' | 'draft' | 'final'
export type PlanItemType =
  | 'song'
  | 'reading'
  | 'sermon'
  | 'prayer'
  | 'communion'
  | 'offering'
  | 'notices'
  | 'baptism'
  | 'custom'

export interface EventType {
  id: number
  name: string
  description?: string | null
  colour?: string | null
  hasOrderOfService: boolean
  tracksAttendance: boolean
  defaultLocation: 'church' | 'address'
  displayOrder: number
  active: boolean
}

export interface Address {
  id?: number | null
  street?: string | null
  streetNumber?: string | null
  suburb?: string | null
  city?: string | null
  building?: string | null
  unit?: string | null
  province?: string | null
  postalCode?: string | null
}

export interface EventLocation {
  useChurchAddress: boolean
  address?: Address | null
  venue?: string | null
  onlineUrl?: string | null
}

export interface LocationInput {
  useChurchAddress: boolean
  addressId?: number | null
  venue?: string | null
  onlineUrl?: string | null
}

export interface Recurrence {
  frequency: Frequency
  interval: number
  weekdays: Weekday[]
  positions: number[]
  until?: string | null
  label?: string
}

export interface EventSeries {
  id: number
  title: string
  description?: string | null
  eventType: EventType
  groupId?: number | null
  groupName?: string | null
  imageId?: number | null
  location: EventLocation
  startDate: string
  startTime?: string | null
  endTime?: string | null
  allDay: boolean
  recurrence?: Recurrence | null
  scheduleLabel: string
  nextDate?: string | null
  status: string
}

export interface Occurrence {
  key: string
  id?: number | null
  seriesId: number
  originalDate: string
  date: string
  startTime?: string | null
  endTime?: string | null
  allDay: boolean
  title: string
  description?: string | null
  eventType: EventType
  groupId?: number | null
  groupName?: string | null
  imageId?: number | null
  location: EventLocation
  isRecurring: boolean
  scheduleLabel: string
  status: 'scheduled' | 'cancelled'
  cancelReason?: string | null
  overriddenFields: string[]
  planState?: PlanState | null
  planItemCount: number
}

export interface PlanItem {
  id?: number
  position?: number
  itemType: PlanItemType
  title?: string | null
  songId?: number | null
  songKey?: string | null
  scriptureReference?: string | null
  personId?: number | null
  personName?: string | null
  durationMinutes?: number | null
  notes?: string | null
  songName?: string | null
  songCcliNumber?: string | null
  songDefaultKey?: string | null
  personDisplayName?: string | null
  plannedStart?: string | null
}

export interface Plan {
  occurrence: Occurrence
  initialised: boolean
  status: 'draft' | 'final'
  totalMinutes: number
  items: PlanItem[]
}

export interface EventDraft {
  eventTypeId: number | null
  title: string
  description?: string | null
  groupId?: number | null
  startDate: string
  startTime?: string | null
  endTime?: string | null
  allDay: boolean
  location: LocationInput
  recurrence: Recurrence | null
}

export interface SongUsage {
  songId: number
  name?: string | null
  code?: string | null
  ccliNumber?: string | null
  timesUsed: number
  lastUsed?: string | null
}

export interface SongUsageDetail {
  songId: number
  timesUsedLast12Months: number
  lastUsed?: string | null
  nextScheduled?: string | null
  history: { date: string; seriesId: number; title: string; songKey?: string | null; cancelled: boolean }[]
}

export function emptyDraft(date: string): EventDraft {
  return {
    eventTypeId: null,
    title: '',
    description: '',
    groupId: null,
    startDate: date,
    startTime: '09:00',
    endTime: '10:30',
    allDay: false,
    location: { useChurchAddress: false, venue: '', onlineUrl: '' },
    recurrence: null,
  }
}

export function draftFromSeries(series: EventSeries, date?: string): EventDraft {
  return {
    eventTypeId: series.eventType.id,
    title: series.title,
    description: series.description ?? '',
    groupId: series.groupId ?? null,
    startDate: date || series.startDate,
    startTime: series.startTime?.slice(0, 5) ?? '',
    endTime: series.endTime?.slice(0, 5) ?? '',
    allDay: series.allDay,
    location: {
      useChurchAddress: series.location.useChurchAddress,
      addressId: series.location.address?.id ?? null,
      venue: series.location.venue ?? '',
      onlineUrl: series.location.onlineUrl ?? '',
    },
    recurrence: series.recurrence
      ? {
          frequency: series.recurrence.frequency,
          interval: series.recurrence.interval,
          weekdays: [...series.recurrence.weekdays],
          positions: [...series.recurrence.positions],
          until: series.recurrence.until ?? null,
        }
      : null,
  }
}

export function draftFromOccurrence(occurrence: Occurrence): EventDraft {
  return {
    eventTypeId: occurrence.eventType.id,
    title: occurrence.title,
    description: occurrence.description ?? '',
    groupId: occurrence.groupId ?? null,
    startDate: occurrence.date,
    startTime: occurrence.startTime?.slice(0, 5) ?? '',
    endTime: occurrence.endTime?.slice(0, 5) ?? '',
    allDay: occurrence.allDay,
    location: {
      useChurchAddress: occurrence.location.useChurchAddress,
      addressId: occurrence.location.address?.id ?? null,
      venue: occurrence.location.venue ?? '',
      onlineUrl: occurrence.location.onlineUrl ?? '',
    },
    recurrence: null,
  }
}

export const occurrencePath = (seriesId: number | string, originalDate: string) =>
  `/events/occurrences/${seriesId}/${originalDate}`

export const eventsApi = {
  types: (includeInactive = false) =>
    axios.get<EventType[]>('/events/types', { params: { include_inactive: includeInactive } }).then((r) => r.data),
  createType: (payload: Partial<EventType>) => axios.post<EventType>('/events/types', payload).then((r) => r.data),
  updateType: (id: number, payload: Partial<EventType>) =>
    axios.put<EventType>(`/events/types/${id}`, payload).then((r) => r.data),
  deleteType: (id: number) => axios.delete<EventType | { deleted: boolean }>(`/events/types/${id}`).then((r) => r.data),

  occurrences: (params: {
    start: string
    end: string
    typeIds?: number[]
    groupId?: number | null
    includeCancelled?: boolean
    servicesOnly?: boolean
  }) =>
    axios
      .get<Occurrence[]>('/events', {
        params: {
          start: params.start,
          end: params.end,
          type_id: params.typeIds?.length ? params.typeIds : undefined,
          group_id: params.groupId || undefined,
          include_cancelled: params.includeCancelled ?? true,
          services_only: params.servicesOnly || undefined,
        },
        paramsSerializer: { indexes: null },
      })
      .then((r) => r.data),
  upcomingServices: (days = 28) =>
    axios.get<Occurrence[]>('/services/upcoming', { params: { days } }).then((r) => r.data),
  create: (draft: EventDraft) => axios.post<EventSeries>('/events', draftPayload(draft)).then((r) => r.data),

  seriesList: (params: { groupId?: number; typeId?: number; includeArchived?: boolean } = {}) =>
    axios
      .get<EventSeries[]>('/events/series', {
        params: { group_id: params.groupId, type_id: params.typeId, include_archived: params.includeArchived },
      })
      .then((r) => r.data),
  series: (id: number | string) => axios.get<EventSeries>(`/events/series/${id}`).then((r) => r.data),
  archiveSeries: (id: number) => axios.delete<EventSeries>(`/events/series/${id}`).then((r) => r.data),
  restoreSeries: (id: number) => axios.post<EventSeries>(`/events/series/${id}/restore`).then((r) => r.data),
  uploadSeriesImage: (id: number, file: File) => upload(`/events/series/${id}/image`, file),
  removeSeriesImage: (id: number) => axios.delete<EventSeries>(`/events/series/${id}/image`).then((r) => r.data),
  duplicateSeries: (id: number, payload: { date: string; title?: string; startTime?: string | null }) =>
    axios.post<EventSeries>(`/events/series/${id}/duplicate`, payload).then((r) => r.data),
  cancelRange: (id: number, payload: { start: string; end: string; reason?: string | null }) =>
    axios.post<Occurrence[]>(`/events/series/${id}/cancel-range`, payload).then((r) => r.data),
  template: (id: number | string) => axios.get<PlanItem[]>(`/events/series/${id}/template`).then((r) => r.data),
  saveTemplate: (id: number | string, items: PlanItem[]) =>
    axios.put<PlanItem[]>(`/events/series/${id}/template`, { items: items.map(itemPayload) }).then((r) => r.data),

  occurrence: (seriesId: number | string, date: string) =>
    axios.get<Occurrence>(occurrencePath(seriesId, date)).then((r) => r.data),
  updateOccurrence: (seriesId: number, date: string, scope: EditScope, draft: Partial<EventDraft> & { date?: string }) =>
    axios.patch<Occurrence>(occurrencePath(seriesId, date), { scope, ...draft }).then((r) => r.data),
  cancel: (seriesId: number, date: string, reason?: string | null) =>
    axios.post<Occurrence>(`${occurrencePath(seriesId, date)}/cancel`, { reason: reason || null }).then((r) => r.data),
  restore: (seriesId: number, date: string) =>
    axios.post<Occurrence>(`${occurrencePath(seriesId, date)}/restore`).then((r) => r.data),
  uploadOccurrenceImage: (seriesId: number, date: string, file: File) =>
    upload(`${occurrencePath(seriesId, date)}/image`, file),
  removeOccurrenceImage: (seriesId: number, date: string) =>
    axios.delete<Occurrence>(`${occurrencePath(seriesId, date)}/image`).then((r) => r.data),
  duplicateOccurrence: (seriesId: number, date: string, payload: { date: string; title?: string | null }) =>
    axios.post<Occurrence>(`${occurrencePath(seriesId, date)}/duplicate`, payload).then((r) => r.data),

  plan: (seriesId: number | string, date: string) =>
    axios.get<Plan>(`${occurrencePath(seriesId, date)}/plan`).then((r) => r.data),
  savePlan: (seriesId: number | string, date: string, status: 'draft' | 'final', items: PlanItem[]) =>
    axios
      .put<Plan>(`${occurrencePath(seriesId, date)}/plan`, { status, items: items.map(itemPayload) })
      .then((r) => r.data),
  resetPlan: (seriesId: number | string, date: string) =>
    axios.delete<Plan>(`${occurrencePath(seriesId, date)}/plan`).then((r) => r.data),

  songUsage: (start: string, end: string, limit?: number) =>
    axios.get<SongUsage[]>('/songs/usage', { params: { start, end, limit } }).then((r) => r.data),
  songUsageDetail: (songId: number | string) =>
    axios.get<SongUsageDetail>(`/song/${songId}/usage`).then((r) => r.data),
  ccliReportCsv: (start: string, end: string) =>
    axios.get<string>('/songs/ccli-report', { params: { start, end }, responseType: 'text' }).then((r) => r.data),
}

function upload(url: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return axios.post(url, form).then((r) => r.data)
}

export function itemPayload(item: PlanItem) {
  return {
    itemType: item.itemType,
    title: item.title || null,
    songId: item.songId || null,
    songKey: item.songKey || null,
    scriptureReference: item.scriptureReference || null,
    personId: item.personId || null,
    personName: item.personId ? null : item.personName || null,
    durationMinutes: item.durationMinutes ?? null,
    notes: item.notes || null,
  }
}

export function draftPayload(draft: EventDraft) {
  return {
    eventTypeId: draft.eventTypeId,
    title: draft.title.trim(),
    description: draft.description || null,
    groupId: draft.groupId || null,
    startDate: draft.startDate,
    startTime: draft.allDay ? null : draft.startTime || null,
    endTime: draft.allDay ? null : draft.endTime || null,
    allDay: draft.allDay,
    location: locationPayload(draft.location),
    recurrence: recurrencePayload(draft.recurrence),
  }
}

export function locationPayload(location: LocationInput) {
  return {
    useChurchAddress: location.useChurchAddress,
    addressId: location.useChurchAddress ? null : location.addressId || null,
    venue: location.venue || null,
    onlineUrl: location.onlineUrl || null,
  }
}

export function recurrencePayload(recurrence: Recurrence | null) {
  if (!recurrence) return null
  return {
    frequency: recurrence.frequency,
    interval: recurrence.interval || 1,
    weekdays: recurrence.frequency === 'yearly' ? [] : recurrence.weekdays,
    positions: recurrence.frequency === 'monthly' ? recurrence.positions : [],
    until: recurrence.until || null,
  }
}
