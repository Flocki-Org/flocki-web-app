<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { emptyDraft, eventsApi, type EventDraft, type EventType, type Occurrence } from '@/api/events'
import EventForm from '@/components/events/EventForm.vue'
import Button from '@/components/Forms/Button.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import Toaster from '@/components/Widgets/Toaster.vue'
import { groupByDate, isoDate, monthGrid, occurrenceRoute, startOfWeek, timeRange, typeColour } from '@/utils/events'

type ViewMode = 'month' | 'week' | 'agenda'

const router = useRouter()
const mode = ref<ViewMode>('month')
const cursor = ref(dayjs())
const types = ref<EventType[]>([])
const selectedTypeIds = ref<number[]>([])
const groupId = ref<number | ''>('')
const groups = ref<{ id: number; name: string }[]>([])
const occurrences = ref<Occurrence[]>([])
const loading = ref(false)
const error = ref('')
const showCreate = ref(false)
const creating = ref(false)
const draft = ref<EventDraft>(emptyDraft(isoDate(dayjs())))

const range = computed(() => {
  if (mode.value === 'week') {
    const start = startOfWeek(cursor.value)
    return { start, end: start.add(6, 'day') }
  }
  const start = cursor.value.startOf('month')
  return { start, end: start.endOf('month') }
})

const heading = computed(() =>
  mode.value === 'week'
    ? `${range.value.start.format('D MMM')} – ${range.value.end.format('D MMM YYYY')}`
    : cursor.value.format('MMMM YYYY'),
)

const weeks = computed(() => monthGrid(cursor.value.startOf('month')))
const weekDays = computed(() => Array.from({ length: 7 }, (_, index) => range.value.start.add(index, 'day')))
const byDate = computed(() => groupByDate(occurrences.value))
const agendaDays = computed(() =>
  [...byDate.value.entries()].sort(([left], [right]) => left.localeCompare(right)),
)

const onDate = (date: string) => byDate.value.get(date) ?? []

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    occurrences.value = await eventsApi.occurrences({
      start: isoDate(range.value.start),
      end: isoDate(range.value.end),
      typeIds: selectedTypeIds.value,
      groupId: groupId.value || null,
    })
  } catch {
    error.value = "Couldn't load the calendar."
  } finally {
    loading.value = false
  }
}

eventsApi.types().then((rows) => {
  types.value = rows
})
import('@/axios').then(({ axios }) =>
  axios.get('/groups', { params: { page: 1, page_size: 100 } }).then((response) => {
    groups.value = response.data.items ?? []
  }),
)

watch([cursor, mode, selectedTypeIds, groupId], load, { immediate: true, deep: true })

const step = (direction: number) => {
  cursor.value = mode.value === 'week' ? cursor.value.add(direction, 'week') : cursor.value.add(direction, 'month')
}

const toggleType = (id: number) => {
  selectedTypeIds.value = selectedTypeIds.value.includes(id)
    ? selectedTypeIds.value.filter((value) => value !== id)
    : [...selectedTypeIds.value, id]
}

const openCreate = (date?: string) => {
  draft.value = emptyDraft(date || isoDate(cursor.value))
  showCreate.value = true
}

const createEvent = async () => {
  if (!draft.value.title.trim() || !draft.value.eventTypeId || !draft.value.startDate) {
    error.value = 'An event needs a type, title and date.'
    return
  }
  creating.value = true
  try {
    const series = await eventsApi.create(draft.value)
    showCreate.value = false
    await router.push({ name: 'event-occurrence', params: { seriesId: series.id, date: series.startDate } })
  } catch (err: unknown) {
    error.value = messageOf(err)
  } finally {
    creating.value = false
  }
}

function messageOf(err: unknown) {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  return typeof detail === 'string' ? detail : "Couldn't save the event."
}
</script>

<template>
  <Toaster :message="error" type="error" :show="Boolean(error)" @close="error = ''" />
  <div class="app-page">
    <div class="app-page-header">
      <h1 class="grow min-w-0">Events</h1>
      <router-link class="app-link-btn" :to="{ name: 'event-types' }">Event types</router-link>
      <Button @click="openCreate()">Add event</Button>
    </div>

    <div class="app-page-section space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <div class="app-segmented">
          <button type="button" :class="{ 'is-active': mode === 'month' }" @click="mode = 'month'">Month</button>
          <button type="button" :class="{ 'is-active': mode === 'week' }" @click="mode = 'week'">Week</button>
          <button type="button" :class="{ 'is-active': mode === 'agenda' }" @click="mode = 'agenda'">Agenda</button>
        </div>
        <button type="button" class="app-link-btn" @click="step(-1)">Previous</button>
        <button type="button" class="app-link-btn" @click="cursor = dayjs()">Today</button>
        <button type="button" class="app-link-btn" @click="step(1)">Next</button>
        <h2 class="min-w-40">{{ heading }}</h2>
        <select v-model="groupId" class="app-field-sm ml-auto">
          <option value="">All groups</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
        </select>
      </div>

      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="type in types"
          :key="type.id"
          type="button"
          class="app-chip-toggle"
          :class="{ 'is-active': selectedTypeIds.length === 0 || selectedTypeIds.includes(type.id) }"
          @click="toggleType(type.id)"
        >
          <span class="mr-1 inline-block h-2 w-2 rounded-full" :style="{ background: typeColour(type.colour) }" />
          {{ type.name }}
        </button>
      </div>

      <p v-if="loading" class="text-sm text-gray-500">Loading events…</p>

      <div v-else-if="mode === 'month'" class="app-panel overflow-hidden">
        <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
          <div v-for="label in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="label" class="px-1 py-2">{{ label }}</div>
        </div>
        <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
          <button
            v-for="day in week"
            :key="isoDate(day)"
            type="button"
            class="min-h-24 border-r border-gray-100 p-1 text-left last:border-r-0 hover:bg-gray-50"
            :class="{ 'bg-gray-50/70 text-gray-400': day.month() !== cursor.month() }"
            @click="openCreate(isoDate(day))"
          >
            <span class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs" :class="{ 'bg-sky-600 text-white': isoDate(day) === isoDate(dayjs()) }">
              {{ day.date() }}
            </span>
            <span
              v-for="event in onDate(isoDate(day)).slice(0, 3)"
              :key="event.key"
              class="mt-1 block truncate rounded px-1 text-xs text-white"
              :class="{ 'line-through opacity-70': event.status === 'cancelled' }"
              :style="{ background: typeColour(event.eventType.colour) }"
              @click.stop="router.push(occurrenceRoute(event))"
            >
              {{ event.title }}
            </span>
            <span v-if="onDate(isoDate(day)).length > 3" class="mt-1 block text-xs text-gray-500">+{{ onDate(isoDate(day)).length - 3 }} more</span>
          </button>
        </div>
      </div>

      <div v-else-if="mode === 'week'" class="grid gap-3 lg:grid-cols-7">
        <section v-for="day in weekDays" :key="isoDate(day)" class="app-panel p-3">
          <button type="button" class="text-sm font-semibold text-gray-800" @click="openCreate(isoDate(day))">
            {{ day.format('ddd D') }}
          </button>
          <button
            v-for="event in onDate(isoDate(day))"
            :key="event.key"
            type="button"
            class="mt-2 block w-full rounded-md border-l-4 bg-gray-50 px-2 py-1.5 text-left"
            :style="{ borderColor: typeColour(event.eventType.colour) }"
            @click="router.push(occurrenceRoute(event))"
          >
            <span class="block text-sm font-medium text-gray-900" :class="{ 'line-through': event.status === 'cancelled' }">{{ event.title }}</span>
            <span class="block text-xs text-gray-500">{{ timeRange(event) }}</span>
          </button>
        </section>
      </div>

      <div v-else class="app-panel">
        <div v-if="agendaDays.length === 0" class="app-empty-state m-4">
          <p>Nothing scheduled in this range.</p>
        </div>
        <div v-for="[date, events] in agendaDays" :key="date" class="border-b border-gray-100 last:border-b-0">
          <h3 class="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">{{ dayjs(date).format('dddd D MMMM') }}</h3>
          <button
            v-for="event in events"
            :key="event.key"
            type="button"
            class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
            @click="router.push(occurrenceRoute(event))"
          >
            <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ background: typeColour(event.eventType.colour) }" />
            <span class="w-28 shrink-0 text-sm text-gray-500">{{ timeRange(event) }}</span>
            <span class="min-w-0">
              <span class="block truncate font-medium text-gray-900" :class="{ 'line-through': event.status === 'cancelled' }">{{ event.title }}</span>
              <span class="block truncate text-xs text-gray-500">{{ event.eventType.name }}<template v-if="event.groupName"> · {{ event.groupName }}</template></span>
            </span>
            <span v-if="event.status === 'cancelled'" class="ml-auto text-xs text-red-600">Cancelled</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <Dialog :show="showCreate" title="Add event" :is-form="true" size="lg" @close="showCreate = false" @submit="createEvent">
    <EventForm v-model="draft" mode="create" />
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="showCreate = false">Cancel</Button></div>
        <Button type="submit" :show-loader="creating">Create</Button>
      </div>
    </template>
  </Dialog>
</template>
