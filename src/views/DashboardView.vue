<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { computed, inject, ref } from 'vue'
import { eventsApi, type Occurrence, type SongUsage } from '@/api/events'
import Button from '@/components/Forms/Button.vue'
import Toaster from '@/components/Widgets/Toaster.vue'
import { isoDate, occurrenceRoute, planRoute, startOfWeek, timeRange } from '@/utils/events'

interface WidgetSetting {
  id: string
  visible: boolean
}
interface CatalogueEntry {
  id: string
  label: string
}
interface Summary {
  peopleTotal: number
  peopleNewLast30Days: number
  peopleByStatus: { status: string; count: number }[]
  peopleWithoutEmail: number
  peopleWithoutMobile: number
  peopleWithoutGroup: number
  groupsActive: number
  groupMembershipsActive: number
}

const axios = inject<AxiosInstance>('axios')!
const error = ref('')
const editing = ref(false)
const saving = ref(false)
const customised = ref(false)
const widgets = ref<WidgetSetting[]>([])
const catalogue = ref<CatalogueEntry[]>([])
const summary = ref<Summary | null>(null)
const weekEvents = ref<Occurrence[]>([])
const services = ref<Occurrence[]>([])
const birthdays = ref<Record<string, any>[]>([])
const anniversaries = ref<Record<string, any>[]>([])
const recentPeople = ref<Record<string, any>[]>([])
const topSongs = ref<SongUsage[]>([])

const labelFor = (id: string) => catalogue.value.find((entry) => entry.id === id)?.label ?? id
const visibleWidgets = computed(() => widgets.value.filter((widget) => editing.value || widget.visible))

const load = async () => {
  try {
    const layout = await axios.get('/dashboard/layout')
    widgets.value = layout.data.widgets
    catalogue.value = layout.data.catalogue
    customised.value = layout.data.customised
    const today = dayjs()
    const [summaryResponse, week, upcoming, birthdayResponse, anniversaryResponse, recentResponse, songs] = await Promise.all([
      axios.get<Summary>('/dashboard/summary'),
      eventsApi.occurrences({ start: isoDate(startOfWeek(today)), end: isoDate(startOfWeek(today).add(6, 'day')) }),
      eventsApi.upcomingServices(21),
      axios.get('/people/upcoming-birthdays', { params: { days: 30 } }),
      axios.get('/people/upcoming-anniversaries', { params: { days: 30 } }),
      axios.get('/people', { params: { sort: 'registered_date', direction: 'desc', page: 1, page_size: 5 } }),
      eventsApi.songUsage(isoDate(today.subtract(90, 'day')), isoDate(today), 5),
    ])
    summary.value = summaryResponse.data
    weekEvents.value = week
    services.value = upcoming.filter((service) => service.planState !== 'final' && service.status !== 'cancelled')
    birthdays.value = birthdayResponse.data
    anniversaries.value = anniversaryResponse.data
    recentPeople.value = recentResponse.data.items ?? []
    topSongs.value = songs
  } catch {
    error.value = "Couldn't load the dashboard."
  }
}

load()

const move = (index: number, direction: number) => {
  const target = index + direction
  if (target < 0 || target >= widgets.value.length) return
  const next = [...widgets.value]
  const [row] = next.splice(index, 1)
  next.splice(target, 0, row)
  widgets.value = next
}

const saveLayout = async () => {
  saving.value = true
  try {
    const response = await axios.put('/dashboard/layout', { widgets: widgets.value })
    widgets.value = response.data.widgets
    customised.value = true
    editing.value = false
  } catch {
    error.value = "Couldn't save the layout."
  } finally {
    saving.value = false
  }
}

const resetLayout = async () => {
  const response = await axios.delete('/dashboard/layout')
  widgets.value = response.data.widgets
  customised.value = false
  editing.value = false
}

const personName = (person: Record<string, any>) =>
  [person.preferredName || person.firstName, person.lastName].filter(Boolean).join(' ')

const statusLabel = (status: string) => status.replaceAll('_', ' ')
</script>

<template>
  <Toaster :message="error" type="error" :show="Boolean(error)" @close="error = ''" />
  <div class="app-page">
    <div class="app-page-header">
      <div class="grow min-w-0">
        <h1>Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">{{ customised ? 'Your layout' : 'Default layout' }}. Each staff member keeps their own.</p>
      </div>
      <Button v-if="!editing" stealth @click="editing = true">Arrange</Button>
      <template v-else>
        <Button stealth @click="resetLayout">Reset</Button>
        <Button stealth @click="editing = false">Done</Button>
        <Button :show-loader="saving" @click="saveLayout">Save layout</Button>
      </template>
    </div>

    <div class="app-page-section grid gap-4 pb-10 lg:grid-cols-2">
      <section v-for="(widget, index) in visibleWidgets" :key="widget.id" class="app-panel" :class="{ 'opacity-50': editing && !widget.visible }">
        <header class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <h2 class="grow text-base">{{ labelFor(widget.id) }}</h2>
          <template v-if="editing">
            <button type="button" class="app-toolbar-btn" @click="move(index, -1)">↑</button>
            <button type="button" class="app-toolbar-btn" @click="move(index, 1)">↓</button>
            <button type="button" class="app-link-btn" @click="widget.visible = !widget.visible">{{ widget.visible ? 'Hide' : 'Show' }}</button>
          </template>
        </header>
        <div class="px-4 py-3 text-sm text-gray-700">
          <template v-if="widget.id === 'this_week'">
            <p v-if="weekEvents.length === 0" class="text-gray-500">Nothing scheduled this week.</p>
            <router-link v-for="event in weekEvents" :key="event.key" class="flex items-baseline justify-between gap-3 border-b border-gray-50 py-2 no-underline last:border-b-0" :to="occurrenceRoute(event)">
              <span :class="{ 'line-through': event.status === 'cancelled' }">{{ event.title }}</span>
              <span class="shrink-0 text-xs text-gray-500">{{ dayjs(event.date).format('ddd') }} {{ timeRange(event) }}</span>
            </router-link>
          </template>

          <template v-else-if="widget.id === 'services_to_plan'">
            <p v-if="services.length === 0" class="text-gray-500">Every upcoming service has a final plan.</p>
            <router-link v-for="service in services" :key="service.key" class="flex items-baseline justify-between gap-3 border-b border-gray-50 py-2 no-underline last:border-b-0" :to="planRoute(service)">
              <span>{{ service.title }}</span>
              <span class="shrink-0 text-xs text-gray-500">{{ dayjs(service.date).format('D MMM') }} · {{ service.planState === 'draft' ? 'Draft' : 'Not started' }}</span>
            </router-link>
          </template>

          <template v-else-if="widget.id === 'people_overview' && summary">
            <p class="text-2xl font-semibold text-gray-900">{{ summary.peopleTotal }} <span class="text-sm font-normal text-gray-500">people</span></p>
            <p class="mt-1 text-gray-500">{{ summary.peopleNewLast30Days }} added in the last 30 days</p>
            <ul class="mt-3 space-y-1">
              <li v-for="row in summary.peopleByStatus" :key="row.status" class="flex justify-between capitalize">
                <span>{{ statusLabel(row.status) }}</span><span>{{ row.count }}</span>
              </li>
            </ul>
          </template>

          <template v-else-if="widget.id === 'birthdays'">
            <p v-if="birthdays.length === 0" class="text-gray-500">No birthdays in the next 30 days.</p>
            <router-link v-for="person in birthdays" :key="person.id" class="block py-1 no-underline" :to="{ name: 'person', params: { id: person.id } }">
              {{ personName(person) }} <span class="text-xs text-gray-500">{{ person.dateOfBirth ? dayjs(person.dateOfBirth).format('D MMM') : '' }}</span>
            </router-link>
          </template>

          <template v-else-if="widget.id === 'anniversaries'">
            <p v-if="anniversaries.length === 0" class="text-gray-500">No anniversaries in the next 30 days.</p>
            <router-link v-for="person in anniversaries" :key="person.id" class="block py-1 no-underline" :to="{ name: 'person', params: { id: person.id } }">
              {{ personName(person) }} <span class="text-xs text-gray-500">{{ person.marriageDate ? dayjs(person.marriageDate).format('D MMM') : '' }}</span>
            </router-link>
          </template>

          <template v-else-if="widget.id === 'recent_people'">
            <router-link v-for="person in recentPeople" :key="person.id" class="block py-1 no-underline" :to="{ name: 'person', params: { id: person.id } }">
              {{ personName(person) }}
            </router-link>
          </template>

          <template v-else-if="widget.id === 'contact_gaps' && summary">
            <p>{{ summary.peopleWithoutEmail }} without an email</p>
            <p class="mt-1">{{ summary.peopleWithoutMobile }} without a phone number</p>
          </template>

          <template v-else-if="widget.id === 'not_in_group' && summary">
            <p class="text-2xl font-semibold text-gray-900">{{ summary.peopleWithoutGroup }}</p>
            <p class="text-gray-500">people are not in an active group</p>
          </template>

          <template v-else-if="widget.id === 'groups_overview' && summary">
            <p class="text-2xl font-semibold text-gray-900">{{ summary.groupsActive }} <span class="text-sm font-normal text-gray-500">active {{ summary.groupsActive === 1 ? 'group' : 'groups' }}</span></p>
            <p class="mt-1 text-gray-500">{{ summary.groupMembershipsActive }} {{ summary.groupMembershipsActive === 1 ? 'membership' : 'memberships' }}</p>
          </template>

          <template v-else-if="widget.id === 'top_songs'">
            <p v-if="topSongs.length === 0" class="text-gray-500">No songs used in the last 90 days.</p>
            <router-link v-for="song in topSongs" :key="song.songId" class="flex justify-between py-1 no-underline" :to="{ name: 'song', params: { id: song.songId } }">
              <span>{{ song.name }}</span><span class="text-xs text-gray-500">{{ song.timesUsed }}</span>
            </router-link>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>
