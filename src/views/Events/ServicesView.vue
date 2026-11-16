<script setup lang="ts">
import dayjs from 'dayjs'
import { ref } from 'vue'
import { eventsApi, type Occurrence } from '@/api/events'
import Toaster from '@/components/Widgets/Toaster.vue'
import { planRoute, timeRange, typeColour } from '@/utils/events'

const services = ref<Occurrence[]>([])
const days = ref(28)
const error = ref('')

const load = async () => {
  try {
    services.value = await eventsApi.upcomingServices(days.value)
  } catch {
    error.value = "Couldn't load services."
  }
}

load()

const statusLabel: Record<string, string> = {
  not_started: 'Not started',
  draft: 'Draft',
  final: 'Final',
}
</script>

<template>
  <Toaster :message="error" type="error" :show="Boolean(error)" @close="error = ''" />
  <div class="app-page">
    <div class="app-page-header">
      <h1 class="grow">Services</h1>
      <select v-model.number="days" class="app-field-sm" @change="load">
        <option :value="14">Next 2 weeks</option>
        <option :value="28">Next 4 weeks</option>
        <option :value="90">Next 3 months</option>
      </select>
    </div>
    <div class="app-page-section">
      <div v-if="services.length === 0" class="app-empty-state">
        <p>No services with an order of service in this range.</p>
      </div>
      <div v-else class="app-panel">
        <div class="app-table-wrap">
          <table class="app-data-table min-w-[40rem]">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Plan</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in services" :key="service.key">
                <td class="whitespace-nowrap">
                  <p>{{ dayjs(service.date).format('ddd D MMM') }}</p>
                  <p class="text-xs text-gray-500">{{ timeRange(service) }}</p>
                </td>
                <td>
                  <p class="font-medium" :class="{ 'line-through': service.status === 'cancelled' }">{{ service.title }}</p>
                  <p class="text-xs text-gray-500">
                    <span class="mr-1 inline-block h-2 w-2 rounded-full" :style="{ background: typeColour(service.eventType.colour) }" />
                    {{ service.eventType.name }}
                  </p>
                </td>
                <td>
                  <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {{ statusLabel[service.planState || 'not_started'] }}
                  </span>
                  <span class="ml-2 text-xs text-gray-500">{{ service.planItemCount }} items</span>
                </td>
                <td>
                  <router-link class="app-link-btn" :to="planRoute(service)">Open plan</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
