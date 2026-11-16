<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/Forms/Button.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import Paginator from '@/components/Paginator.vue'
import Toaster from '@/components/Widgets/Toaster.vue'

interface Song {
  id: number
  name: string
  code?: string | null
  songKey?: string | null
  ccliNumber?: string | null
  secondaryName?: string | null
}

const axios = inject<AxiosInstance>('axios')!
const router = useRouter()
const songs = ref<Song[]>([])
const search = ref('')
const page = ref(1)
const totalPages = ref(1)
const error = ref('')
const showAdd = ref(false)
const saving = ref(false)
const draft = ref({ name: '', songKey: '', ccliNumber: '', secondaryName: '' })

const load = async (currentPage = 1) => {
  try {
    const response = await axios.get('/songs', { params: { page: currentPage, page_size: 20, search: search.value || undefined } })
    songs.value = response.data.items
    page.value = response.data.page
    totalPages.value = response.data.pages || 1
  } catch {
    error.value = "Couldn't load songs."
  }
}

load()

const createSong = async () => {
  if (!draft.value.name.trim()) return
  saving.value = true
  try {
    const response = await axios.post<Song>('/song', draft.value)
    showAdd.value = false
    await router.push({ name: 'song', params: { id: response.data.id } })
  } catch (err) {
    error.value = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Couldn't add the song."
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Toaster :message="error" type="error" :show="Boolean(error)" @close="error = ''" />
  <div class="app-page">
    <div class="app-page-header">
      <h1 class="grow">Song library</h1>
      <router-link class="app-link-btn" :to="{ name: 'ccli-report' }">CCLI report</router-link>
      <Button @click="showAdd = true">Add song</Button>
    </div>
    <div class="app-page-section space-y-4">
      <form class="flex gap-2" @submit.prevent="load(1)">
        <input v-model="search" class="app-field max-w-md" placeholder="Search name, code or CCLI number" />
        <Button type="submit">Search</Button>
      </form>
      <div v-if="songs.length === 0" class="app-empty-state"><p>No songs match.</p></div>
      <div v-else class="app-panel">
        <table class="app-data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Song</th>
              <th>Key</th>
              <th>CCLI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="song in songs" :key="song.id">
              <td class="text-gray-500">{{ song.code }}</td>
              <td>
                <router-link class="font-medium no-underline" :to="{ name: 'song', params: { id: song.id } }">{{ song.name }}</router-link>
                <p v-if="song.secondaryName" class="text-xs text-gray-400">{{ song.secondaryName }}</p>
              </td>
              <td>{{ song.songKey }}</td>
              <td>{{ song.ccliNumber }}</td>
            </tr>
          </tbody>
        </table>
        <Paginator :page="page" :total-pages="totalPages" :items-per-page="20" :load-page="(next) => load(next)" />
      </div>
    </div>
  </div>
  <Dialog :show="showAdd" title="Add song" :is-form="true" @close="showAdd = false" @submit="createSong">
    <div class="space-y-3">
      <input v-model="draft.name" class="app-field" placeholder="Song name" />
      <input v-model="draft.secondaryName" class="app-field" placeholder="Secondary name" />
      <input v-model="draft.songKey" class="app-field" placeholder="Default key" />
      <input v-model="draft.ccliNumber" class="app-field" placeholder="CCLI number" />
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="showAdd = false">Cancel</Button></div>
        <Button type="submit" :show-loader="saving">Add</Button>
      </div>
    </template>
  </Dialog>
</template>
