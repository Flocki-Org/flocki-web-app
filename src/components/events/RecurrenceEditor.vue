<script setup lang="ts">
import { computed } from 'vue'
import type { Frequency, Recurrence, Weekday } from '@/api/events'
import { POSITIONS, WEEKDAYS, describeRecurrence, monthPosition, weekdayCode } from '@/utils/events'

const props = defineProps<{
  startDate: string
  modelValue: Recurrence | null
}>()

const emit = defineEmits<{
  'update:modelValue': [Recurrence | null]
}>()

type Pattern = 'once' | Frequency

const pattern = computed(() => props.modelValue?.frequency ?? 'once')
const monthlyOnWeekday = computed(() => props.modelValue?.frequency === 'monthly' && props.modelValue.weekdays.length > 0)
const preview = computed(() => describeRecurrence(props.startDate, props.modelValue))

const blank = (frequency: Frequency): Recurrence => {
  const weekday = weekdayCode(props.startDate || new Date().toISOString())
  const position = monthPosition(props.startDate || new Date().toISOString())
  return {
    frequency,
    interval: props.modelValue?.interval || 1,
    weekdays: frequency === 'yearly' ? [] : props.modelValue?.weekdays?.length ? [...props.modelValue.weekdays] : [weekday],
    positions: frequency === 'monthly' ? (props.modelValue?.positions?.length ? [...props.modelValue.positions] : [position.nth]) : [],
    until: props.modelValue?.until ?? null,
  }
}

const setPattern = (value: Pattern) => {
  if (value === 'once') {
    emit('update:modelValue', null)
    return
  }
  const next = props.modelValue?.frequency === value ? { ...props.modelValue } : blank(value)
  if (value === 'monthly') {
    next.weekdays = []
    next.positions = []
  }
  if (value === 'yearly') {
    next.weekdays = []
    next.positions = []
  }
  emit('update:modelValue', next)
}

const setMonthlyStyle = (onWeekday: boolean) => {
  const next = blank('monthly')
  if (!onWeekday) {
    next.weekdays = []
    next.positions = []
  }
  emit('update:modelValue', next)
}

const patch = (partial: Partial<Recurrence>) => {
  if (!props.modelValue) return
  emit('update:modelValue', { ...props.modelValue, ...partial })
}

const toggleWeekday = (code: Weekday) => {
  if (!props.modelValue) return
  const current = props.modelValue.weekdays
  const weekdays = current.includes(code) ? current.filter((day) => day !== code) : [...current, code]
  patch({ weekdays })
}

const togglePosition = (value: number) => {
  if (!props.modelValue) return
  const current = props.modelValue.positions
  const positions = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
  patch({ positions })
}
</script>

<template>
  <div class="space-y-3">
    <div>
      <label class="app-label" for="event-repeat">Repeats</label>
      <select id="event-repeat" class="app-field" :value="pattern" @change="setPattern(($event.target as HTMLSelectElement).value as Pattern)">
        <option value="once">Does not repeat</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>

    <div v-if="modelValue && modelValue.frequency !== 'yearly'" class="flex items-center gap-2">
      <label class="text-sm text-gray-700" for="event-interval">Every</label>
      <input
        id="event-interval"
        class="app-field w-20"
        type="number"
        min="1"
        max="52"
        :value="modelValue.interval"
        @input="patch({ interval: Math.min(52, Math.max(1, Number(($event.target as HTMLInputElement).value) || 1)) })"
      />
      <span class="text-sm text-gray-600">{{ modelValue.frequency === 'weekly' ? 'weeks' : 'months' }}</span>
    </div>

    <div v-if="modelValue?.frequency === 'weekly'">
      <p class="app-label">On</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="day in WEEKDAYS"
          :key="day.code"
          type="button"
          class="app-chip-toggle"
          :class="{ 'is-active': modelValue.weekdays.includes(day.code) }"
          @click="toggleWeekday(day.code)"
        >
          {{ day.short }}
        </button>
      </div>
    </div>

    <div v-if="modelValue?.frequency === 'monthly'" class="space-y-3">
      <div class="app-segmented">
        <button type="button" :class="{ 'is-active': !monthlyOnWeekday }" @click="setMonthlyStyle(false)">On this date</button>
        <button type="button" :class="{ 'is-active': monthlyOnWeekday }" @click="setMonthlyStyle(true)">On the nth weekday</button>
      </div>
      <template v-if="monthlyOnWeekday">
        <div>
          <p class="app-label">Which</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="position in POSITIONS"
              :key="position.value"
              type="button"
              class="app-chip-toggle"
              :class="{ 'is-active': modelValue.positions.includes(position.value) }"
              @click="togglePosition(position.value)"
            >
              {{ position.label }}
            </button>
          </div>
        </div>
        <div>
          <p class="app-label">Weekday</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="day in WEEKDAYS"
              :key="day.code"
              type="button"
              class="app-chip-toggle"
              :class="{ 'is-active': modelValue.weekdays.includes(day.code) }"
              @click="toggleWeekday(day.code)"
            >
              {{ day.short }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <div v-if="modelValue">
      <label class="app-label" for="event-until">Ends</label>
      <div class="flex flex-wrap items-center gap-3">
        <label class="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="radio" name="event-until" :checked="!modelValue.until" @change="patch({ until: null })" />
          Never
        </label>
        <label class="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="radio" name="event-until" :checked="Boolean(modelValue.until)" @change="patch({ until: modelValue.until || startDate })" />
          On
        </label>
        <input
          v-if="modelValue.until"
          class="app-field w-auto"
          type="date"
          :value="modelValue.until"
          @input="patch({ until: ($event.target as HTMLInputElement).value || null })"
        />
      </div>
    </div>

    <p class="text-sm text-gray-500">{{ preview }}</p>
  </div>
</template>
