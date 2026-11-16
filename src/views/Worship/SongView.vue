<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { inject, ref } from 'vue'
import { useRoute } from 'vue-router'
import { eventsApi, type SongUsageDetail } from '@/api/events'
import Toaster from '@/components/Widgets/Toaster.vue'

const axios = inject<AxiosInstance>('axios')!
const route = useRoute()
const song = ref<Record<string, any> | null>(null)
const usage = ref<SongUsageDetail | null>(null)
const error = ref('')

Promise.all([axios.get(`/song/${route.params.id}`), eventsApi.songUsageDetail(String(route.params.id))])
  .then(([songResponse, detail]) => {
    song.value = songResponse.data
    usage.value = detail
  })
  .catch(() => {
    error.value = "Couldn't load this song."
  })
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
</template>
