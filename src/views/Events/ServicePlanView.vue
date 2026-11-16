<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { eventsApi, type Plan, type PlanItem, type PlanItemType } from '@/api/events'
import Button from '@/components/Forms/Button.vue'
import Toaster from '@/components/Widgets/Toaster.vue'
import { PLAN_ITEM_TYPES, formatTime, planItemLabel, timeRange } from '@/utils/events'

const props = defineProps<{ template?: boolean }>()
const route = useRoute()
const axios = inject<AxiosInstance>('axios')!
const plan = ref<Plan | null>(null)
const items = ref<PlanItem[]>([])
const status = ref<'draft' | 'final'>('draft')
const error = ref('')
const notice = ref('')
const saving = ref(false)
const songQuery = ref<Record<number, string>>({})
const songResults = ref<Record<number, { id: number; name: string; songKey?: string | null }[]>>({})
const personQuery = ref<Record<number, string>>({})
const personResults = ref<Record<number, { id: number; firstName?: string; lastName?: string; preferredName?: string }[]>>({})

const seriesId = computed(() => String(route.params.seriesId))
const date = computed(() => String(route.params.date || ''))

const load = async () => {
  error.value = ''
  try {
    if (props.template) {
      const templateItems = await eventsApi.template(seriesId.value)
      items.value = templateItems.map(blankItem)
      return
    }
    plan.value = await eventsApi.plan(seriesId.value, date.value)
    status.value = plan.value.status
    items.value = plan.value.items.map(blankItem)
  } catch {
    error.value = "Couldn't load the order of service."
  }
}

watch(() => route.fullPath, load, { immediate: true })

const total = computed(() => items.value.reduce((sum, item) => sum + (Number(item.durationMinutes) || 0), 0))

const addItem = (type: PlanItemType) => {
  const preset = PLAN_ITEM_TYPES.find((entry) => entry.value === type)
  items.value.push({
    itemType: type,
    title: '',
    durationMinutes: preset?.defaultMinutes ?? 5,
    personName: '',
    songKey: '',
    scriptureReference: '',
    notes: '',
  })
}

const move = (index: number, direction: number) => {
  const target = index + direction
  if (target < 0 || target >= items.value.length) return
  const next = [...items.value]
  const [row] = next.splice(index, 1)
  next.splice(target, 0, row)
  items.value = next
}

const save = async () => {
  saving.value = true
  error.value = ''
  try {
    if (props.template) {
      items.value = await eventsApi.saveTemplate(seriesId.value, items.value)
      notice.value = 'Template saved. New plans start from this.'
    } else {
      plan.value = await eventsApi.savePlan(seriesId.value, date.value, status.value, items.value)
      items.value = plan.value.items.map(blankItem)
      notice.value = status.value === 'final' ? 'Plan marked final.' : 'Draft saved.'
    }
  } catch (err) {
    error.value = detail(err)
  } finally {
    saving.value = false
  }
}

const reset = async () => {
  plan.value = await eventsApi.resetPlan(seriesId.value, date.value)
  items.value = plan.value.items.map(blankItem)
  status.value = 'draft'
  notice.value = 'This date is back on the template.'
}

const searchSongs = async (index: number) => {
  const term = songQuery.value[index] || ''
  if (term.trim().length < 2) {
    songResults.value[index] = []
    return
  }
  const response = await axios.get('/songs', { params: { search: term, page: 1, page_size: 8 } })
  songResults.value[index] = response.data.items ?? []
}

const chooseSong = (index: number, song: { id: number; name: string; songKey?: string | null }) => {
  const item = items.value[index]
  item.songId = song.id
  item.songName = song.name
  item.title = song.name
  if (!item.songKey) item.songKey = song.songKey || ''
  songResults.value[index] = []
  songQuery.value[index] = ''
}

const searchPeople = async (index: number) => {
  const term = personQuery.value[index] || ''
  if (term.trim().length < 2) {
    personResults.value[index] = []
    return
  }
  const response = await axios.get('/people', { params: { full_name: term, page: 1, page_size: 8 } })
  personResults.value[index] = response.data.items ?? []
}

const choosePerson = (index: number, person: { id: number; firstName?: string; lastName?: string; preferredName?: string }) => {
  const item = items.value[index]
  item.personId = person.id
  item.personName = ''
  item.personDisplayName = [person.preferredName || person.firstName, person.lastName].filter(Boolean).join(' ')
  personResults.value[index] = []
  personQuery.value[index] = ''
}

const clearPerson = (index: number) => {
  items.value[index].personId = null
  items.value[index].personDisplayName = ''
}

function blankItem(item: PlanItem): PlanItem {
  return { ...item, title: item.title ?? '', personName: item.personName ?? '', songKey: item.songKey ?? '', notes: item.notes ?? '' }
}

function detail(err: unknown) {
  const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
  return typeof message === 'string' ? message : "Couldn't save the order of service."
}

const heading = computed(() => {
  if (props.template) return 'Order of service template'
  if (!plan.value) return 'Order of service'
  return plan.value.occurrence.title
})

const plannedStart = (index: number) => {
  const start = plan.value?.occurrence.startTime
  if (!start) return ''
  const [hours, minutes] = start.split(':').map(Number)
  const elapsed = items.value.slice(0, index).reduce((sum, item) => sum + (Number(item.durationMinutes) || 0), 0)
  const totalMinutes = hours * 60 + minutes + elapsed
  return formatTime(`${String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`)
}

const printPlan = () => window.print()
</script>

<template>
  <Toaster :message="error" type="error" :show="Boolean(error)" @close="error = ''" />
  <Toaster :message="notice" type="success" :show="Boolean(notice)" :timeout="2500" @close="notice = ''" />

  <div class="app-page print-hidden">
    <div class="app-page-header">
      <router-link class="inline-flex text-gray-600 no-underline" :to="template ? { name: 'events' } : { name: 'services' }" aria-label="Back">
        <svg class="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z" /></svg>
      </router-link>
      <div class="grow min-w-0">
        <h1>{{ heading }}</h1>
        <p v-if="plan" class="mt-1 text-sm text-gray-500">
          {{ dayjs(plan.occurrence.date).format('dddd D MMMM YYYY') }} · {{ timeRange(plan.occurrence) }}
          <template v-if="!plan.initialised"> · showing the series template</template>
        </p>
      </div>
      <button type="button" class="app-link-btn" @click="printPlan">Print</button>
      <router-link v-if="!template && plan" class="app-link-btn" :to="{ name: 'service-template', params: { seriesId } }">Edit template</router-link>
    </div>

    <div class="app-page-section space-y-4 pb-10">
      <div class="flex flex-wrap gap-2">
        <button v-for="type in PLAN_ITEM_TYPES" :key="type.value" type="button" class="app-chip-toggle" @click="addItem(type.value)">
          + {{ type.label }}
        </button>
      </div>

      <div v-if="items.length === 0" class="app-empty-state">
        <p>Add songs, readings, a sermon and the other parts of the service.</p>
      </div>

      <article v-for="(item, index) in items" :key="index" class="app-panel app-panel-pad space-y-3 py-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ planItemLabel(item.itemType) }}</span>
          <span v-if="plannedStart(index)" class="text-xs text-gray-400">{{ plannedStart(index) }}</span>
          <span class="ml-auto flex gap-1">
            <button type="button" class="app-toolbar-btn" aria-label="Move up" @click="move(index, -1)">↑</button>
            <button type="button" class="app-toolbar-btn" aria-label="Move down" @click="move(index, 1)">↓</button>
            <button type="button" class="app-danger-btn" @click="items.splice(index, 1)">Remove</button>
          </span>
        </div>

        <div v-if="item.itemType === 'song'" class="space-y-2">
          <p v-if="item.songId" class="text-sm text-gray-800">
            {{ item.songName || item.title }}
            <button type="button" class="ml-2 text-sky-700" @click="item.songId = null">Change</button>
          </p>
          <input v-else v-model="songQuery[index]" class="app-field" placeholder="Search the song library" @input="searchSongs(index)" />
          <ul v-if="songResults[index]?.length" class="rounded-md border border-gray-200">
            <li v-for="song in songResults[index]" :key="song.id">
              <button type="button" class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50" @click="chooseSong(index, song)">
                {{ song.name }}<span v-if="song.songKey" class="text-gray-400"> · {{ song.songKey }}</span>
              </button>
            </li>
          </ul>
          <input v-model="item.songKey" class="app-field" placeholder="Key for this service" />
        </div>

        <input v-else v-model="item.title" class="app-field" :placeholder="item.itemType === 'sermon' ? 'Sermon title' : 'Title'" />
        <input v-if="item.itemType === 'reading' || item.itemType === 'sermon'" v-model="item.scriptureReference" class="app-field" placeholder="Passage, such as John 1:1-14" />

        <div class="space-y-2">
          <p v-if="item.personId" class="text-sm text-gray-800">
            {{ item.personDisplayName }}
            <button type="button" class="ml-2 text-sky-700" @click="clearPerson(index)">Change</button>
          </p>
          <template v-else>
            <input v-model="personQuery[index]" class="app-field" placeholder="Search people, or type a guest name below" @input="searchPeople(index)" />
            <ul v-if="personResults[index]?.length" class="rounded-md border border-gray-200">
              <li v-for="person in personResults[index]" :key="person.id">
                <button type="button" class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50" @click="choosePerson(index, person)">
                  {{ person.preferredName || person.firstName }} {{ person.lastName }}
                </button>
              </li>
            </ul>
            <input v-model="item.personName" class="app-field" placeholder="Guest name" />
          </template>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm text-gray-700">
            Minutes
            <input v-model.number="item.durationMinutes" class="app-field mt-1" type="number" min="0" max="600" />
          </label>
          <label class="text-sm text-gray-700">
            Notes
            <input v-model="item.notes" class="app-field mt-1" />
          </label>
        </div>
      </article>

      <div class="flex flex-wrap items-center gap-3">
        <p class="text-sm text-gray-600">{{ total }} minutes planned</p>
        <div v-if="!template" class="app-segmented">
          <button type="button" :class="{ 'is-active': status === 'draft' }" @click="status = 'draft'">Draft</button>
          <button type="button" :class="{ 'is-active': status === 'final' }" @click="status = 'final'">Final</button>
        </div>
        <Button :show-loader="saving" @click="save">{{ template ? 'Save template' : 'Save plan' }}</Button>
        <button v-if="!template && plan?.initialised" type="button" class="app-link-btn" @click="reset">Reset to template</button>
      </div>
    </div>
  </div>

  <article v-if="plan || template" class="mx-auto hidden max-w-3xl px-8 py-6 print:block">
    <p class="text-sm uppercase tracking-wide text-gray-500">{{ template ? 'Template' : 'Run sheet' }}</p>
    <h1 class="mt-1">{{ heading }}</h1>
    <p v-if="plan" class="mt-1 text-sm text-gray-600">{{ dayjs(plan.occurrence.date).format('dddd D MMMM YYYY') }} · {{ timeRange(plan.occurrence) }}</p>
    <table class="mt-6 w-full text-sm">
      <tbody>
        <tr v-for="(item, index) in items" :key="index" class="border-b border-gray-200">
          <td class="w-16 py-2 align-top text-gray-500">{{ plannedStart(index) }}</td>
          <td class="py-2 align-top">
            <p class="font-medium">{{ item.songName || item.title || planItemLabel(item.itemType) }}</p>
            <p class="text-gray-600">
              {{ planItemLabel(item.itemType) }}
              <template v-if="item.songKey"> · {{ item.songKey }}</template>
              <template v-if="item.scriptureReference"> · {{ item.scriptureReference }}</template>
              <template v-if="item.personDisplayName || item.personName"> · {{ item.personDisplayName || item.personName }}</template>
            </p>
            <p v-if="item.notes" class="text-gray-500">{{ item.notes }}</p>
          </td>
          <td class="w-16 py-2 text-right align-top text-gray-500">{{ item.durationMinutes || 0 }}m</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>
