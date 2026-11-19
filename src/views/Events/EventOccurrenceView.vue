<script setup lang="ts">
import type { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  draftFromOccurrence,
  draftFromSeries,
  eventsApi,
  locationPayload,
  recurrencePayload,
  type EditScope,
  type EventDraft,
  type EventSeries,
  type Occurrence,
} from '@/api/events'
import EventForm from '@/components/events/EventForm.vue'
import Button from '@/components/Forms/Button.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import Toaster from '@/components/Widgets/Toaster.vue'
import { getFullImageUrl } from '@/imageUtils'
import CachedImage from '@/components/CachedImage.vue'
import { humanDate } from '@/utils/dates'
import { locationLine, planRoute, timeRange, typeColour } from '@/utils/events'

const route = useRoute()
const router = useRouter()
const occurrence = ref<Occurrence | null>(null)
const series = ref<EventSeries | null>(null)
const error = ref('')
const notice = ref('')
const editing = ref<'date' | 'series' | null>(null)
const scope = ref<EditScope>('all')
const draft = ref<EventDraft | null>(null)
const saving = ref(false)
const reason = ref('')
const showCancelRange = ref(false)
const range = ref({ start: '', end: '', reason: '' })
const showDuplicate = ref(false)
const duplicate = ref({ date: '', title: '' })
const imageInput = ref<HTMLInputElement | null>(null)
const imageForSeries = ref(false)

const seriesId = computed(() => Number(route.params.seriesId))
const originalDate = computed(() => String(route.params.date))

const load = async () => {
  error.value = ''
  try {
    const [loadedOccurrence, loadedSeries] = await Promise.all([
      eventsApi.occurrence(seriesId.value, originalDate.value),
      eventsApi.series(seriesId.value),
    ])
    occurrence.value = loadedOccurrence
    series.value = loadedSeries
  } catch {
    error.value = "Couldn't open this event."
  }
}

watch(() => route.fullPath, load, { immediate: true })

const startEdit = (kind: 'date' | 'series') => {
  if (!occurrence.value || !series.value) return
  editing.value = kind
  scope.value = kind === 'series' ? 'all' : 'this'
  draft.value = kind === 'series' ? draftFromSeries(series.value) : draftFromOccurrence(occurrence.value)
}

const save = async () => {
  if (!draft.value || !occurrence.value) return
  if (!draft.value.title.trim()) {
    error.value = 'An event needs a title.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const current = occurrence.value
    let saved: Occurrence
    if (editing.value === 'date' || !current.isRecurring) {
      saved = await eventsApi.updateOccurrence(current.seriesId, current.originalDate, 'this', dateChanges(current, draft.value))
    } else if (scope.value === 'following') {
      saved = await eventsApi.updateOccurrence(current.seriesId, current.originalDate, 'following', seriesChanges(draft.value))
    } else {
      await eventsApiUpdateSeries(current.seriesId, draft.value)
      saved = await eventsApi.occurrence(current.seriesId, current.originalDate)
    }
    editing.value = null
    notice.value = 'Saved.'
    if (saved.seriesId !== seriesId.value || saved.originalDate !== originalDate.value) {
      await router.replace({ name: 'event-occurrence', params: { seriesId: saved.seriesId, date: saved.originalDate } })
    } else {
      await load()
    }
  } catch (err) {
    error.value = messageOf(err)
  } finally {
    saving.value = false
  }
}

async function eventsApiUpdateSeries(id: number, value: EventDraft) {
  const { axios } = await import('@/axios')
  await axios.put(`/events/series/${id}`, {
    eventTypeId: value.eventTypeId,
    title: value.title.trim(),
    description: value.description || null,
    groupId: value.groupId || null,
    startDate: value.startDate,
    startTime: value.allDay ? null : value.startTime || null,
    endTime: value.allDay ? null : value.endTime || null,
    allDay: value.allDay,
    location: locationPayload(value.location),
    recurrence: recurrencePayload(value.recurrence),
  })
}

function dateChanges(current: Occurrence, value: EventDraft) {
  return {
    title: value.title.trim(),
    description: value.description || null,
    date: value.startDate === current.date ? undefined : value.startDate,
    startTime: value.startTime || null,
    endTime: value.endTime || null,
    location: locationPayload(value.location),
  }
}

function seriesChanges(value: EventDraft) {
  return {
    title: value.title.trim(),
    description: value.description || null,
    eventTypeId: value.eventTypeId,
    groupId: value.groupId || null,
    allDay: value.allDay,
    startTime: value.allDay ? null : value.startTime || null,
    endTime: value.allDay ? null : value.endTime || null,
    location: locationPayload(value.location),
    recurrence: recurrencePayload(value.recurrence),
  }
}

const cancelDate = async () => {
  if (!occurrence.value) return
  try {
    occurrence.value = await eventsApi.cancel(occurrence.value.seriesId, occurrence.value.originalDate, reason.value)
    reason.value = ''
    notice.value = 'This date is cancelled.'
  } catch (err) {
    error.value = messageOf(err)
  }
}

const restoreDate = async () => {
  if (!occurrence.value) return
  occurrence.value = await eventsApi.restore(occurrence.value.seriesId, occurrence.value.originalDate)
}

const submitRange = async () => {
  if (!occurrence.value) return
  try {
    await eventsApi.cancelRange(occurrence.value.seriesId, range.value)
    showCancelRange.value = false
    notice.value = 'Those dates are cancelled.'
    await load()
  } catch (err) {
    error.value = messageOf(err)
  }
}

const submitDuplicate = async () => {
  if (!occurrence.value || !duplicate.value.date) return
  try {
    const copy = await eventsApi.duplicateOccurrence(occurrence.value.seriesId, occurrence.value.originalDate, {
      date: duplicate.value.date,
      title: duplicate.value.title || null,
    })
    showDuplicate.value = false
    await router.push({ name: 'event-occurrence', params: { seriesId: copy.seriesId, date: copy.originalDate } })
  } catch (err) {
    error.value = messageOf(err)
  }
}

const onImage = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !occurrence.value) return
  try {
    if (imageForSeries.value) {
      await uploadSeries(occurrence.value.seriesId, file)
      occurrence.value = await eventsApi.occurrence(occurrence.value.seriesId, occurrence.value.originalDate)
      notice.value = 'Series image updated.'
    } else {
      occurrence.value = await eventsApi.uploadOccurrenceImage(occurrence.value.seriesId, occurrence.value.originalDate, file)
      notice.value = 'Image updated for this date.'
    }
  } catch (err) {
    error.value = messageOf(err)
  }
}

async function uploadSeries(id: number, file: File) {
  await eventsApi.uploadSeriesImage(id, file)
  return eventsApi.occurrence(id, originalDate.value)
}

const removeImage = async () => {
  if (!occurrence.value) return
  occurrence.value = imageForSeries.value
    ? await eventsApi.removeSeriesImage(occurrence.value.seriesId).then(() => eventsApi.occurrence(seriesId.value, originalDate.value))
    : await eventsApi.removeOccurrenceImage(occurrence.value.seriesId, occurrence.value.originalDate)
}

const archive = async () => {
  if (!series.value || !confirm(`Archive “${series.value.title}”? Future dates disappear from the calendar.`)) return
  await eventsApi.archiveSeries(series.value.id)
  await router.push({ name: 'events' })
}

function messageOf(err: unknown) {
  const detail = (err as AxiosError<{ detail?: string }>).response?.data?.detail
  return typeof detail === 'string' ? detail : "Couldn't save that change."
}
</script>

<template>
  <Toaster :message="error" type="error" :show="Boolean(error)" @close="error = ''" />
  <Toaster :message="notice" type="success" :show="Boolean(notice)" :timeout="2500" @close="notice = ''" />
  <div class="app-page" v-if="occurrence && series">
    <div class="app-page-header">
      <router-link class="inline-flex shrink-0 text-gray-600 no-underline hover:text-sky-600" :to="{ name: 'events' }" aria-label="Back to events">
        <svg class="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z" /></svg>
      </router-link>
      <h1 class="grow min-w-0" :class="{ 'line-through': occurrence.status === 'cancelled' }">{{ occurrence.title }}</h1>
      <span class="rounded-full px-2.5 py-0.5 text-xs font-medium text-white" :style="{ background: typeColour(occurrence.eventType.colour) }">
        {{ occurrence.eventType.name }}
      </span>
    </div>

    <div class="app-detail-grid">
      <div class="app-detail-primary space-y-5">
        <div class="app-panel app-panel-pad py-6">
          <p class="text-sm text-gray-500">{{ dayjs(occurrence.date).format('dddd D MMMM YYYY') }}</p>
          <p class="mt-1 text-lg font-medium text-gray-900">{{ timeRange(occurrence) }}</p>
          <p class="mt-2 text-sm text-gray-600">{{ occurrence.scheduleLabel }}</p>
          <p v-if="occurrence.groupName" class="mt-2 text-sm text-gray-600">{{ occurrence.groupName }}</p>
          <p v-if="locationLine(occurrence.location)" class="mt-2 text-sm text-gray-700">{{ locationLine(occurrence.location) }}</p>
          <a v-if="occurrence.location.onlineUrl" class="mt-1 block text-sm" :href="occurrence.location.onlineUrl">{{ occurrence.location.onlineUrl }}</a>
          <p v-if="occurrence.description" class="mt-4 text-sm leading-6 text-gray-700">{{ occurrence.description }}</p>
          <p v-if="occurrence.status === 'cancelled'" class="mt-4 text-sm font-medium text-red-700">
            Cancelled<template v-if="occurrence.cancelReason">: {{ occurrence.cancelReason }}</template>
          </p>
          <p v-if="occurrence.overriddenFields.length" class="mt-3 text-xs text-gray-500">
            This date differs from the series: {{ occurrence.overriddenFields.join(', ') }}.
          </p>
          <CachedImage v-if="occurrence.imageId" class="mt-4 max-h-56 rounded-lg object-cover" :src="getFullImageUrl('/images/' + occurrence.imageId)" alt="" />
        </div>

        <div v-if="occurrence.eventType.hasOrderOfService" class="app-panel app-panel-pad py-6">
          <h2>Order of service</h2>
          <p class="mt-2 text-sm text-gray-600">
            {{ occurrence.planState === 'final' ? 'Final' : occurrence.planState === 'draft' ? 'Draft' : 'Not started' }}
            · {{ occurrence.planItemCount }} {{ occurrence.planItemCount === 1 ? 'item' : 'items' }}
          </p>
          <router-link class="app-link-btn mt-4" :to="planRoute(occurrence)">Open the plan</router-link>
        </div>
      </div>

      <div class="app-detail-aside">
        <div class="app-panel app-panel-pad space-y-3 py-6">
          <h2>Actions</h2>
          <div class="flex flex-wrap gap-2">
            <Button @click="startEdit('date')">Edit this date</Button>
            <Button v-if="occurrence.isRecurring" stealth @click="startEdit('series')">Edit the series</Button>
            <button type="button" class="app-link-btn" @click="showDuplicate = true">Duplicate</button>
            <button v-if="occurrence.status === 'cancelled'" type="button" class="app-link-btn" @click="restoreDate">Restore this date</button>
            <button v-else type="button" class="app-danger-btn" @click="cancelDate">Cancel this date</button>
          </div>
          <input v-if="occurrence.status !== 'cancelled'" v-model="reason" class="app-field" placeholder="Reason for cancelling" />
          <label class="inline-flex items-center gap-2 text-sm text-gray-700">
            <input v-model="imageForSeries" type="checkbox" />
            Apply the image to every date
          </label>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="app-link-btn" @click="imageInput?.click()">{{ occurrence.imageId ? 'Replace image' : 'Add image' }}</button>
            <button v-if="occurrence.imageId" type="button" class="app-link-btn" @click="removeImage">Remove image</button>
            <input ref="imageInput" class="hidden" type="file" accept="image/*" @change="onImage" />
          </div>
          <button v-if="occurrence.isRecurring" type="button" class="app-link-btn" @click="showCancelRange = true">Cancel a range of dates</button>
          <button type="button" class="app-danger-btn" @click="archive">Archive series</button>
          <p v-if="series.nextDate" class="text-xs text-gray-500">Next date: {{ humanDate(series.nextDate) }}</p>
        </div>
      </div>
    </div>
  </div>

  <Dialog :show="editing !== null" :title="editing === 'series' ? 'Edit the series' : 'Edit this date'" :is-form="true" size="lg" @close="editing = null" @submit="save">
    <div v-if="editing === 'series' && occurrence?.isRecurring" class="mb-4">
      <p class="app-label">Apply to</p>
      <div class="app-segmented">
        <button type="button" :class="{ 'is-active': scope === 'all' }" @click="scope = 'all'">All dates</button>
        <button type="button" :class="{ 'is-active': scope === 'following' }" @click="scope = 'following'">This date and following</button>
      </div>
      <p class="mt-2 text-xs text-gray-500">All dates clears matching overrides. This date and following starts a new series.</p>
    </div>
    <EventForm v-if="draft" v-model="draft" :mode="editing === 'series' ? 'series' : 'occurrence'" />
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="editing = null">Cancel</Button></div>
        <Button type="submit" :show-loader="saving">Save</Button>
      </div>
    </template>
  </Dialog>

  <Dialog :show="showCancelRange" title="Cancel a range" :is-form="true" @close="showCancelRange = false" @submit="submitRange">
    <div class="space-y-3">
      <label class="app-label" for="range-start">From</label>
      <input id="range-start" v-model="range.start" class="app-field" type="date" />
      <label class="app-label" for="range-end">To</label>
      <input id="range-end" v-model="range.end" class="app-field" type="date" />
      <input v-model="range.reason" class="app-field" placeholder="Reason" />
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="showCancelRange = false">Close</Button></div>
        <Button type="submit">Cancel dates</Button>
      </div>
    </template>
  </Dialog>

  <Dialog :show="showDuplicate" title="Duplicate this date" :is-form="true" @close="showDuplicate = false" @submit="submitDuplicate">
    <div class="space-y-3">
      <p class="text-sm text-gray-600">Copies this date, including its order of service, to a new once-off event.</p>
      <label class="app-label" for="duplicate-date">New date</label>
      <input id="duplicate-date" v-model="duplicate.date" class="app-field" type="date" />
      <input v-model="duplicate.title" class="app-field" placeholder="Title, if it should change" />
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="showDuplicate = false">Close</Button></div>
        <Button type="submit">Duplicate</Button>
      </div>
    </template>
  </Dialog>
</template>
