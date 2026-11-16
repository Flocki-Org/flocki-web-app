<script setup lang="ts">
import dayjs from 'dayjs'
import { ref } from 'vue'
import { eventsApi, type SongUsage } from '@/api/events'
import Button from '@/components/Forms/Button.vue'
import Toaster from '@/components/Widgets/Toaster.vue'

const start = ref(dayjs().startOf('year').format('YYYY-MM-DD'))
const end = ref(dayjs().format('YYYY-MM-DD'))
const rows = ref<SongUsage[]>([])
const error = ref('')

const load = async () => {
  try {
    rows.value = await eventsApi.songUsage(start.value, end.value)
  } catch {
    error.value = "Couldn't build the report."
  }
}

load()

const download = async () => {
  const csv = await eventsApi.ccliReportCsv(start.value, end.value)
  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `ccli-report-${start.value}-to-${end.value}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>

<template>
  <Toaster :message="error" type="error" :show="Boolean(error)" @close="error = ''" />
  <div class="app-page">
    <div class="app-page-header">
      <router-link class="inline-flex text-gray-600 no-underline" :to="{ name: 'songs' }" aria-label="Back to songs">
        <svg class="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z" /></svg>
      </router-link>
      <h1 class="grow">CCLI report</h1>
      <Button @click="download">Download CSV</Button>
    </div>
    <div class="app-page-section space-y-4">
      <form class="flex flex-wrap items-end gap-3" @submit.prevent="load">
        <label class="text-sm text-gray-700">From <input v-model="start" class="app-field mt-1" type="date" /></label>
        <label class="text-sm text-gray-700">To <input v-model="end" class="app-field mt-1" type="date" /></label>
        <Button type="submit">Update</Button>
      </form>
      <p class="text-sm text-gray-500">Counts songs on saved plans. Cancelled dates are left out.</p>
      <div class="app-panel">
        <table class="app-data-table">
          <thead>
            <tr>
              <th>Song</th>
              <th>CCLI number</th>
              <th>Times used</th>
              <th>Last used</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rows.length === 0">
              <td colspan="4" class="text-gray-500">No songs were used in this range.</td>
            </tr>
            <tr v-for="row in rows" :key="row.songId">
              <td><router-link class="no-underline" :to="{ name: 'song', params: { id: row.songId } }">{{ row.name }}</router-link></td>
              <td>{{ row.ccliNumber }}</td>
              <td>{{ row.timesUsed }}</td>
              <td>{{ row.lastUsed ? dayjs(row.lastUsed).format('D MMM YYYY') : '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
