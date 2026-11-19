<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, ref } from 'vue'
import PersonAvatar from '@/components/people/PersonAvatar.vue'

export interface PersonHit {
  id: number
  firstName: string
  lastName: string
  email?: string | null
  externalImageUrl?: string | null
  profileImage?: { id?: number | string | null } | null
}

const props = defineProps<{ excludeIds?: number[]; inline?: boolean }>()
const emit = defineEmits<{ select: [person: PersonHit] }>()

const axios = inject<AxiosInstance>('axios')!
const query = ref('')
const results = ref<PersonHit[]>([])
let timer: ReturnType<typeof setTimeout> | undefined

const search = () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(async () => {
    const term = query.value.trim()
    if (term.length < 2) {
      results.value = []
      return
    }
    const response = await axios.get('/people', { params: { full_name: term, page: 1, page_size: 8 } })
    const excluded = new Set(props.excludeIds ?? [])
    results.value = (response.data.items ?? []).filter((person: PersonHit) => !excluded.has(person.id))
  }, 250)
}

const choose = (person: PersonHit) => {
  emit('select', person)
  query.value = ''
  results.value = []
}
</script>

<template>
  <div class="relative">
    <input v-model="query" class="app-field" placeholder="Search by name" @input="search" />
    <ul v-if="results.length" class="mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg" :class="inline ? '' : 'absolute z-10'">
      <li v-for="person in results" :key="person.id">
        <button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-sky-50" @click="choose(person)">
          <PersonAvatar :person="person" />
          <span class="min-w-0">
            <span class="block truncate text-gray-800">{{ person.firstName }} {{ person.lastName }}</span>
            <span v-if="person.email" class="block truncate text-xs text-gray-400">{{ person.email }}</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
