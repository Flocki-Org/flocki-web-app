<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, onMounted, ref } from 'vue'
import type { Address, EventDraft, EventType } from '@/api/events'
import RecurrenceEditor from '@/components/events/RecurrenceEditor.vue'

const props = defineProps<{
  modelValue: EventDraft
  mode?: 'create' | 'occurrence' | 'series'
}>()

const emit = defineEmits<{
  'update:modelValue': [EventDraft]
}>()

const axios = inject<AxiosInstance>('axios')!
const types = ref<EventType[]>([])
const groups = ref<{ id: number; name: string }[]>([])
const addresses = ref<Address[]>([])
const addingAddress = ref(false)
const addressError = ref('')
const newAddress = ref({
  streetNumber: '',
  street: '',
  suburb: '',
  city: '',
  province: '',
  country: 'South Africa',
  postalCode: '',
})

const seriesFields = computed(() => props.mode !== 'occurrence')
const selectedType = computed(() => types.value.find((type) => type.id === props.modelValue.eventTypeId) ?? null)

const patch = (partial: Partial<EventDraft>) => {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}

const addressLine = (address: Address) =>
  [[address.streetNumber, address.street].filter(Boolean).join(' '), address.suburb, address.city].filter(Boolean).join(', ')

onMounted(async () => {
  const [typeResponse, groupResponse, addressResponse] = await Promise.all([
    axios.get<EventType[]>('/events/types'),
    axios.get('/groups', { params: { page: 1, page_size: 100 } }),
    axios.get<Address[]>('/addresses'),
  ])
  types.value = typeResponse.data
  groups.value = groupResponse.data.items ?? []
  addresses.value = addressResponse.data
  if (!props.modelValue.eventTypeId && types.value[0]) {
    chooseType(types.value[0].id)
  }
})

const chooseType = (id: number) => {
  const type = types.value.find((entry) => entry.id === id)
  patch({
    eventTypeId: id,
    location: {
      ...props.modelValue.location,
      useChurchAddress: type ? type.defaultLocation === 'church' : props.modelValue.location.useChurchAddress,
    },
  })
}

const saveAddress = async () => {
  addressError.value = ''
  const draft = newAddress.value
  if (!draft.streetNumber || !draft.street || !draft.suburb || !draft.city || !draft.province || !draft.country) {
    addressError.value = 'Street number, street, suburb, city, province and country are required.'
    return
  }
  const response = await axios.post<Address>('/addresses', { ...draft, type: 'event' })
  addresses.value = [...addresses.value, response.data]
  addingAddress.value = false
  patch({ location: { ...props.modelValue.location, useChurchAddress: false, addressId: response.data.id } })
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="seriesFields">
      <label class="app-label" for="event-type">Event type</label>
      <select id="event-type" class="app-field" :value="modelValue.eventTypeId ?? ''" @change="chooseType(Number(($event.target as HTMLSelectElement).value))">
        <option v-for="type in types" :key="type.id" :value="type.id">{{ type.name }}</option>
      </select>
      <p v-if="selectedType" class="mt-1 text-xs text-gray-500">
        {{ selectedType.hasOrderOfService ? 'Has an order of service.' : 'No order of service.' }}
        {{ selectedType.tracksAttendance ? 'Attendance can be tracked later.' : '' }}
      </p>
    </div>

    <div>
      <label class="app-label" for="event-title">Title</label>
      <input id="event-title" class="app-field" type="text" :value="modelValue.title" @input="patch({ title: ($event.target as HTMLInputElement).value })" />
    </div>

    <div>
      <label class="app-label" for="event-description">Description</label>
      <textarea id="event-description" class="app-field min-h-20" :value="modelValue.description ?? ''" @input="patch({ description: ($event.target as HTMLTextAreaElement).value })" />
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div>
        <label class="app-label" for="event-date">{{ mode === 'occurrence' ? 'Date' : 'Starts' }}</label>
        <input id="event-date" class="app-field" type="date" :value="modelValue.startDate" @input="patch({ startDate: ($event.target as HTMLInputElement).value })" />
      </div>
      <div>
        <label class="app-label" for="event-start">Start time</label>
        <input id="event-start" class="app-field" type="time" :disabled="modelValue.allDay" :value="modelValue.startTime ?? ''" @input="patch({ startTime: ($event.target as HTMLInputElement).value })" />
      </div>
      <div>
        <label class="app-label" for="event-end">End time</label>
        <input id="event-end" class="app-field" type="time" :disabled="modelValue.allDay" :value="modelValue.endTime ?? ''" @input="patch({ endTime: ($event.target as HTMLInputElement).value })" />
      </div>
    </div>

    <label v-if="seriesFields" class="inline-flex items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" :checked="modelValue.allDay" @change="patch({ allDay: ($event.target as HTMLInputElement).checked, startTime: null, endTime: null })" />
      All day
    </label>

    <div v-if="seriesFields">
      <label class="app-label" for="event-group">Group</label>
      <select id="event-group" class="app-field" :value="modelValue.groupId ?? ''" @change="patch({ groupId: Number(($event.target as HTMLSelectElement).value) || null })">
        <option value="">No group</option>
        <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
      </select>
      <p class="mt-1 text-xs text-gray-500">Group members are the expected attendees.</p>
    </div>

    <fieldset class="space-y-3">
      <legend class="app-label">Location</legend>
      <label class="inline-flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          :checked="modelValue.location.useChurchAddress"
          @change="patch({ location: { ...modelValue.location, useChurchAddress: ($event.target as HTMLInputElement).checked } })"
        />
        At the church
      </label>
      <div v-if="!modelValue.location.useChurchAddress" class="space-y-2">
        <select
          class="app-field"
          :value="modelValue.location.addressId ?? ''"
          @change="patch({ location: { ...modelValue.location, addressId: Number(($event.target as HTMLSelectElement).value) || null } })"
        >
          <option value="">Choose an address</option>
          <option v-for="address in addresses" :key="address.id!" :value="address.id!">{{ addressLine(address) }}</option>
        </select>
        <button type="button" class="text-sm font-medium text-sky-700" @click="addingAddress = !addingAddress">
          {{ addingAddress ? 'Hide new address' : 'Add an address' }}
        </button>
        <div v-if="addingAddress" class="grid gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-2">
          <input v-model="newAddress.streetNumber" class="app-field" placeholder="Street number" />
          <input v-model="newAddress.street" class="app-field" placeholder="Street" />
          <input v-model="newAddress.suburb" class="app-field" placeholder="Suburb" />
          <input v-model="newAddress.city" class="app-field" placeholder="City" />
          <input v-model="newAddress.province" class="app-field" placeholder="Province" />
          <input v-model="newAddress.country" class="app-field" placeholder="Country" />
          <input v-model="newAddress.postalCode" class="app-field" placeholder="Postal code" />
          <button type="button" class="app-link-btn" @click="saveAddress">Save address</button>
          <p v-if="addressError" class="text-sm text-red-600 sm:col-span-2">{{ addressError }}</p>
        </div>
      </div>
      <input
        class="app-field"
        type="text"
        placeholder="Venue, such as Main auditorium"
        :value="modelValue.location.venue ?? ''"
        @input="patch({ location: { ...modelValue.location, venue: ($event.target as HTMLInputElement).value } })"
      />
      <input
        class="app-field"
        type="url"
        placeholder="Online link"
        :value="modelValue.location.onlineUrl ?? ''"
        @input="patch({ location: { ...modelValue.location, onlineUrl: ($event.target as HTMLInputElement).value } })"
      />
    </fieldset>

    <RecurrenceEditor v-if="seriesFields" :start-date="modelValue.startDate" :model-value="modelValue.recurrence" @update:model-value="patch({ recurrence: $event })" />
  </div>
</template>
