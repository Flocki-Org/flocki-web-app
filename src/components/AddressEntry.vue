<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

export interface AddressDraft {
  id?: number | null
  type?: string
  streetNumber: string
  street: string
  suburb: string
  city: string
  province: string
  country: string
  postalCode: string
  building?: string
  unit?: string
  latitude?: number | null
  longitude?: number | null
}

const props = defineProps<{ modelValue: AddressDraft }>()
const emit = defineEmits<{ 'update:modelValue': [AddressDraft] }>()

const axios = inject<AxiosInstance>('axios')!
const query = ref('')
const suggestions = ref<Array<AddressDraft & { label: string }>>([])
const searching = ref(false)
const searchUnavailable = ref(false)
const showDetails = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const summary = computed(() => {
  const address = props.modelValue
  return [
    [address.streetNumber, address.street].filter(Boolean).join(' '),
    address.suburb,
    address.city,
    address.postalCode,
  ].filter(Boolean).join(', ')
})

const patch = (partial: Partial<AddressDraft>, clearPin = false) => {
  emit('update:modelValue', {
    ...props.modelValue,
    ...partial,
    latitude: clearPin ? null : partial.latitude ?? props.modelValue.latitude ?? null,
    longitude: clearPin ? null : partial.longitude ?? props.modelValue.longitude ?? null,
  })
}

const search = () => {
  if (timer) clearTimeout(timer)
  const term = query.value.trim()
  if (term.length < 3 || searchUnavailable.value) {
    suggestions.value = []
    return
  }
  timer = setTimeout(async () => {
    searching.value = true
    try {
      const response = await axios.get('/addresses/suggest', { params: { q: term } })
      suggestions.value = response.data || []
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status
      suggestions.value = []
      if (status === 503) {
        searchUnavailable.value = true
        showDetails.value = true
      }
    } finally {
      searching.value = false
    }
  }, 250)
}

const choose = (suggestion: AddressDraft & { label: string }) => {
  emit('update:modelValue', {
    ...props.modelValue,
    streetNumber: suggestion.streetNumber || '',
    street: suggestion.street || '',
    suburb: suggestion.suburb || '',
    city: suggestion.city || '',
    province: suggestion.province || '',
    country: suggestion.country || props.modelValue.country || '',
    postalCode: suggestion.postalCode || '',
    building: suggestion.building || '',
    unit: suggestion.unit || '',
    latitude: suggestion.latitude ?? null,
    longitude: suggestion.longitude ?? null,
  })
  query.value = suggestion.label
  suggestions.value = []
}

const editField = (key: keyof AddressDraft, value: string) => {
  patch({ [key]: value }, true)
}
</script>

<template>
  <div class="space-y-3 sm:col-span-2">
    <label class="block text-sm">
      <span class="app-label">Address</span>
      <input
        v-model="query"
        class="app-field"
        placeholder="Start typing an address"
        autocomplete="off"
        @input="search"
      />
    </label>
    <p v-if="searching" class="text-xs text-gray-400">Searching…</p>
    <ul v-if="suggestions.length" class="overflow-hidden rounded-md border border-gray-200 bg-white">
      <li v-for="suggestion in suggestions" :key="suggestion.label">
        <button type="button" class="block w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-sky-50" @click="choose(suggestion)">
          {{ suggestion.label }}
        </button>
      </li>
    </ul>
    <p v-if="summary && !suggestions.length" class="text-sm text-gray-700">{{ summary }}</p>
    <p v-if="searchUnavailable" class="text-xs text-gray-500">Address search is not configured. Enter the address below.</p>
    <p v-else class="text-xs text-gray-400">Search by Geoapify and OpenStreetMap</p>
    <button type="button" class="text-sm font-medium text-sky-700" @click="showDetails = !showDetails">
      {{ showDetails ? 'Hide address details' : 'Edit address details' }}
    </button>
    <div v-if="showDetails" class="grid gap-3 sm:grid-cols-2">
      <label class="block text-sm"><span class="app-label">Street number</span><input class="app-field" :value="modelValue.streetNumber" @input="editField('streetNumber', ($event.target as HTMLInputElement).value)" /></label>
      <label class="block text-sm"><span class="app-label">Street</span><input class="app-field" :value="modelValue.street" @input="editField('street', ($event.target as HTMLInputElement).value)" /></label>
      <label class="block text-sm"><span class="app-label">Unit</span><input class="app-field" :value="modelValue.unit || ''" @input="editField('unit', ($event.target as HTMLInputElement).value)" /></label>
      <label class="block text-sm"><span class="app-label">Building</span><input class="app-field" :value="modelValue.building || ''" @input="editField('building', ($event.target as HTMLInputElement).value)" /></label>
      <label class="block text-sm"><span class="app-label">Suburb</span><input class="app-field" :value="modelValue.suburb" @input="editField('suburb', ($event.target as HTMLInputElement).value)" /></label>
      <label class="block text-sm"><span class="app-label">City</span><input class="app-field" :value="modelValue.city" @input="editField('city', ($event.target as HTMLInputElement).value)" /></label>
      <label class="block text-sm"><span class="app-label">Province</span><input class="app-field" :value="modelValue.province" @input="editField('province', ($event.target as HTMLInputElement).value)" /></label>
      <label class="block text-sm"><span class="app-label">Country</span><input class="app-field" :value="modelValue.country" @input="editField('country', ($event.target as HTMLInputElement).value)" /></label>
      <label class="block text-sm sm:col-span-2"><span class="app-label">Postal code</span><input class="app-field" :value="modelValue.postalCode" @input="editField('postalCode', ($event.target as HTMLInputElement).value)" /></label>
    </div>
  </div>
</template>
