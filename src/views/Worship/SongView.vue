<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { inject, ref } from 'vue'
import { useRoute } from 'vue-router'
import { eventsApi, type SongUsageDetail } from '@/api/events'
import Button from '@/components/Forms/Button.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import Toaster from '@/components/Widgets/Toaster.vue'

const axios = inject<AxiosInstance>('axios')!
const route = useRoute()
const song = ref<Record<string, any> | null>(null)
const usage = ref<SongUsageDetail | null>(null)
const error = ref('')
const editing = ref(false)
const saving = ref(false)
const draft = ref({
  name: '',
  secondaryName: '',
  code: '',
  songKey: '',
  style: '',
  tempo: '',
  ccliNumber: '',
  videoLink: '',
})

const load = () => {
  Promise.all([axios.get(`/song/${route.params.id}`), eventsApi.songUsageDetail(String(route.params.id))])
    .then(([songResponse, detail]) => {
      song.value = songResponse.data
      usage.value = detail
    })
    .catch(() => {
      error.value = "Couldn't load this song."
    })
}

load()

const openEdit = () => {
  if (!song.value) return
  draft.value = {
    name: song.value.name || '',
    secondaryName: song.value.secondaryName || '',
    code: song.value.code || '',
    songKey: song.value.songKey || '',
    style: song.value.style || '',
    tempo: song.value.tempo || '',
    ccliNumber: song.value.ccliNumber || '',
    videoLink: song.value.videoLink || '',
  }
  editing.value = true
}

const saveSong = async () => {
  if (!song.value || !draft.value.name.trim()) {
    error.value = 'A song needs a name.'
    return
  }
  saving.value = true
  try {
    const response = await axios.put(`/song/${song.value.id}`, {
      name: draft.value.name.trim(),
      secondaryName: draft.value.secondaryName.trim() || null,
      code: draft.value.code.trim() || null,
      songKey: draft.value.songKey.trim() || null,
      style: draft.value.style.trim() || null,
      tempo: draft.value.tempo.trim() || null,
      ccliNumber: draft.value.ccliNumber.trim() || null,
      videoLink: draft.value.videoLink.trim() || null,
    })
    song.value = response.data
    editing.value = false
  } catch (err) {
    const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
    error.value = typeof detail === 'string' ? detail : "Couldn't save this song."
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Toaster :message="error" type="error" :show="Boolean(error)" @close="error = ''" />
  <div class="app-page" v-if="song && usage">
    <div class="app-page-header">
      <router-link class="inline-flex text-gray-600 no-underline" :to="{ name: 'songs' }" aria-label="Back to songs">
        <svg class="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z" /></svg>
      </router-link>
      <div class="grow">
        <h1>{{ song.name }}</h1>
        <p class="mt-1 text-sm text-gray-500">{{ song.code }}<template v-if="song.ccliNumber"> · CCLI {{ song.ccliNumber }}</template><template v-if="song.songKey"> · {{ song.songKey }}</template></p>
      </div>
      <Button stealth @click="openEdit">Edit song</Button>
    </div>
    <div class="app-page-section grid gap-4 lg:grid-cols-3">
      <div class="app-panel p-5">
        <p class="text-sm text-gray-500">Last 12 months</p>
        <p class="text-3xl font-semibold text-gray-900">{{ usage.timesUsedLast12Months }}</p>
      </div>
      <div class="app-panel p-5">
        <p class="text-sm text-gray-500">Last used</p>
        <p class="text-lg font-medium">{{ usage.lastUsed ? dayjs(usage.lastUsed).format('D MMM YYYY') : 'Not yet' }}</p>
      </div>
      <div class="app-panel p-5">
        <p class="text-sm text-gray-500">Next scheduled</p>
        <p class="text-lg font-medium">{{ usage.nextScheduled ? dayjs(usage.nextScheduled).format('D MMM YYYY') : 'None' }}</p>
      </div>
      <div class="app-panel p-5 lg:col-span-3">
        <h2 class="text-base font-semibold text-gray-900">Details</h2>
        <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div v-if="song.secondaryName"><dt class="text-gray-500">Also known as</dt><dd>{{ song.secondaryName }}</dd></div>
          <div v-if="song.style"><dt class="text-gray-500">Style</dt><dd>{{ song.style }}</dd></div>
          <div v-if="song.tempo"><dt class="text-gray-500">Tempo</dt><dd>{{ song.tempo }}</dd></div>
          <div v-if="song.videoLink"><dt class="text-gray-500">Video</dt><dd class="break-all"><a :href="song.videoLink" target="_blank" rel="noreferrer">{{ song.videoLink }}</a></dd></div>
          <div v-if="song.authors?.length"><dt class="text-gray-500">Authors</dt><dd>{{ song.authors.map((author) => author.name).join(', ') }}</dd></div>
        </dl>
      </div>
      <div class="app-panel lg:col-span-3">
        <h2 class="app-panel-pad py-4">Where it has been planned</h2>
        <p v-if="usage.history.length === 0" class="px-5 pb-5 text-sm text-gray-500">This song is not on a saved plan yet.</p>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="(entry, index) in usage.history" :key="index" class="flex items-center gap-3 px-5 py-3 text-sm">
            <span class="w-28 text-gray-500">{{ dayjs(entry.date).format('D MMM YYYY') }}</span>
            <router-link class="no-underline" :to="{ name: 'service-plan', params: { seriesId: entry.seriesId, date: entry.date } }">{{ entry.title }}</router-link>
            <span v-if="entry.songKey" class="text-gray-400">{{ entry.songKey }}</span>
            <span v-if="entry.cancelled" class="text-xs text-red-600">Cancelled</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <Dialog :show="editing" title="Edit song" :is-form="true" @close="editing = false" @submit="saveSong">
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block text-sm sm:col-span-2"><span class="app-label">Name</span><input v-model="draft.name" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Secondary name</span><input v-model="draft.secondaryName" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Code</span><input v-model="draft.code" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Default key</span><input v-model="draft.songKey" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">CCLI number</span><input v-model="draft.ccliNumber" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Style</span><input v-model="draft.style" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Tempo</span><input v-model="draft.tempo" class="app-field" /></label>
      <label class="block text-sm sm:col-span-2"><span class="app-label">Video link</span><input v-model="draft.videoLink" class="app-field" /></label>
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="editing = false">Cancel</Button></div>
        <Button type="submit" :show-loader="saving">Save</Button>
      </div>
    </template>
  </Dialog>
</template>
