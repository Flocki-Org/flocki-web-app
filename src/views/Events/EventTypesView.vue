<script setup lang="ts">
import { ref } from 'vue'
import { eventsApi, type EventType } from '@/api/events'
import Button from '@/components/Forms/Button.vue'
import Toaster from '@/components/Widgets/Toaster.vue'

const types = ref<EventType[]>([])
const error = ref('')
const notice = ref('')
const draft = ref({
  name: '',
  colour: '#0369A1',
  hasOrderOfService: false,
  tracksAttendance: false,
  defaultLocation: 'address' as 'church' | 'address',
})

const load = async () => {
  types.value = await eventsApi.types(true)
}

load().catch(() => {
  error.value = "Couldn't load event types."
})

const addType = async () => {
  if (!draft.value.name.trim()) return
  try {
    await eventsApi.createType(draft.value)
    draft.value.name = ''
    notice.value = 'Event type added.'
    await load()
  } catch (err) {
    error.value = detail(err)
  }
}

const save = async (type: EventType) => {
  try {
    await eventsApi.updateType(type.id, type)
    notice.value = 'Saved.'
    await load()
  } catch (err) {
    error.value = detail(err)
  }
}

const remove = async (type: EventType) => {
  try {
    const result = await eventsApi.deleteType(type.id)
    notice.value = result && 'active' in result && result.active === false ? `${type.name} is in use, so it was deactivated.` : `${type.name} deleted.`
    await load()
  } catch (err) {
    error.value = detail(err)
  }
}

function detail(err: unknown) {
  const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
  return typeof message === 'string' ? message : "Couldn't save the event type."
}
</script>

<template>
  <Toaster :message="error" type="error" :show="Boolean(error)" @close="error = ''" />
  <Toaster :message="notice" type="success" :show="Boolean(notice)" :timeout="2500" @close="notice = ''" />
  <div class="app-page">
    <div class="app-page-header">
      <router-link class="inline-flex text-gray-600 no-underline" :to="{ name: 'events' }" aria-label="Back to events">
        <svg class="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z" /></svg>
      </router-link>
      <h1 class="grow">Event types</h1>
    </div>
    <div class="app-page-section space-y-5">
      <form class="app-panel app-panel-pad grid gap-3 py-5 md:grid-cols-6" @submit.prevent="addType">
        <input v-model="draft.name" class="app-field md:col-span-2" placeholder="New type name" />
        <input v-model="draft.colour" class="app-field" type="color" aria-label="Colour" />
        <select v-model="draft.defaultLocation" class="app-field">
          <option value="church">At the church</option>
          <option value="address">At an address</option>
        </select>
        <label class="inline-flex items-center gap-2 text-sm text-gray-700"><input v-model="draft.hasOrderOfService" type="checkbox" /> Order of service</label>
        <label class="inline-flex items-center gap-2 text-sm text-gray-700"><input v-model="draft.tracksAttendance" type="checkbox" /> Attendance</label>
        <div class="md:col-span-6"><Button type="submit">Add type</Button></div>
      </form>

      <div class="app-panel">
        <div class="app-table-wrap">
          <table class="app-data-table min-w-[48rem]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Colour</th>
                <th>Location</th>
                <th>Order of service</th>
                <th>Attendance</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="type in types" :key="type.id">
                <td><input v-model="type.name" class="app-field" /></td>
                <td><input v-model="type.colour" class="h-9 w-14" type="color" /></td>
                <td>
                  <select v-model="type.defaultLocation" class="app-field">
                    <option value="church">Church</option>
                    <option value="address">Address</option>
                  </select>
                </td>
                <td><input v-model="type.hasOrderOfService" type="checkbox" /></td>
                <td><input v-model="type.tracksAttendance" type="checkbox" /></td>
                <td><input v-model="type.active" type="checkbox" /></td>
                <td class="whitespace-nowrap">
                  <button type="button" class="app-link-btn" @click="save(type)">Save</button>
                  <button type="button" class="app-danger-btn ml-2" @click="remove(type)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
