<script setup>
import { nextTick, ref } from 'vue'
import { getPersonImageUrl } from '@/imageUtils'

const { person, shouldPreventDefault } = defineProps([
  'personId',
  'person',
  'includeName',
  'shouldPreventDefault',
])

const popupEl = ref(null)
const visible = ref(false)
const position = ref({ top: 0, left: 0 })
let showTimer
let hideTimer

const displayName = () => {
  if (!person) return ''
  const first = person.preferredName || person.firstName || ''
  return [first, person.lastName].filter(Boolean).join(' ')
}

const statusLabel = () => {
  const value = person?.lifecycleStatus
  if (!value) return ''
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const placePopup = (trigger) => {
  const popup = popupEl.value
  if (!popup || !trigger) return
  const rect = trigger.getBoundingClientRect()
  const margin = 12
  const width = popup.offsetWidth
  const height = popup.offsetHeight
  let left = rect.left
  if (left + width > window.innerWidth - margin) {
    left = window.innerWidth - width - margin
  }
  left = Math.max(margin, left)

  let top = rect.bottom + 8
  if (top + height > window.innerHeight - margin && rect.top > height + margin) {
    top = rect.top - height - 8
  }
  top = Math.max(margin, Math.min(top, window.innerHeight - height - margin))
  position.value = { top, left }
}

const showProfilePopup = async (event) => {
  clearTimeout(hideTimer)
  clearTimeout(showTimer)
  const trigger = event.currentTarget
  showTimer = setTimeout(async () => {
    visible.value = true
    await nextTick()
    placePopup(trigger)
  }, 320)
}

const scheduleHide = () => {
  clearTimeout(showTimer)
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    visible.value = false
  }, 160)
}

const cancelHide = () => {
  clearTimeout(hideTimer)
}

const handleLinkClick = (event) => {
  if (shouldPreventDefault) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="flex max-w-full items-center">
    <router-link
      v-if="!shouldPreventDefault"
      class="flex w-full max-w-full items-center text-current no-underline hover:text-sky-700"
      :to="{ name: 'person', params: { id: person.id } }"
      @mouseenter="showProfilePopup"
      @mouseleave="scheduleHide"
      @click="handleLinkClick"
    >
      <slot :getPersonImageUrl="getPersonImageUrl"></slot>
    </router-link>
    <a
      v-else
      class="flex w-full max-w-full items-center text-current no-underline hover:text-sky-700"
      :href="`/people/${person.id}`"
      @mouseenter="showProfilePopup"
      @mouseleave="scheduleHide"
      @click="handleLinkClick"
    >
      <slot :getPersonImageUrl="getPersonImageUrl"></slot>
    </a>

    <Teleport to="body">
      <div
        v-show="visible"
        ref="popupEl"
        class="fixed z-[80] w-[min(19rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
        :style="{ top: `${position.top}px`, left: `${position.left}px` }"
        @mouseenter="cancelHide"
        @mouseleave="scheduleHide"
      >
        <div class="flex items-start gap-3 border-b border-gray-100 px-3.5 py-3">
          <img
            class="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-gray-200"
            v-if="getPersonImageUrl(person)"
            :src="getPersonImageUrl(person)"
            alt=""
          >
          <img
            class="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-gray-200"
            v-else
            src="@/assets/default-user-profile.png"
            alt=""
          >
          <div class="min-w-0 flex-1">
            <router-link
              class="block truncate text-sm font-semibold text-gray-900 no-underline hover:text-sky-700"
              :to="{ name: 'person', params: { id: person.id } }"
            >
              {{ displayName() }}
            </router-link>
            <p v-if="person.preferredName && person.firstName && person.preferredName !== person.firstName" class="truncate text-xs text-gray-500">
              {{ person.firstName }} {{ person.lastName }}
            </p>
            <span
              v-if="statusLabel()"
              class="mt-1 inline-flex max-w-full truncate rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800"
            >
              {{ statusLabel() }}
            </span>
          </div>
        </div>
        <dl class="space-y-2 px-3.5 py-3 text-xs">
          <div v-if="person.email" class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2">
            <dt class="text-gray-400">Email</dt>
            <dd class="break-all text-gray-700">{{ person.email }}</dd>
          </div>
          <div v-if="person.mobileNumber" class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2">
            <dt class="text-gray-400">Mobile</dt>
            <dd class="break-all text-gray-700">{{ person.mobileNumber }}</dd>
          </div>
          <div v-if="person.dateOfBirth" class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2">
            <dt class="text-gray-400">Birthday</dt>
            <dd class="text-gray-700">
              {{ $filters.humanDate(person.dateOfBirth) }}
              <span class="text-gray-400">· {{ $filters.durationInYearsOrMonths(person.dateOfBirth) }}</span>
            </dd>
          </div>
          <div v-if="person.categories && person.categories.length" class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2">
            <dt class="text-gray-400">Tags</dt>
            <dd class="flex flex-wrap gap-1">
              <span
                v-for="category in person.categories.slice(0, 3)"
                :key="category.id"
                class="max-w-full truncate rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
              >
                {{ category.name }}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </Teleport>
  </div>
</template>
