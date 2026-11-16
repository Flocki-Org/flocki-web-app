<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, ref } from 'vue'
import { useRoute } from 'vue-router'
import UserProfilePopup from '@/components/people/UserProfilePopup.vue'
import Toaster from '@/components/Widgets/Toaster.vue'
import { getPersonImageUrl } from '@/imageUtils'
import defaultAvatar from '@/assets/default-user-profile.png'

const axios = inject<AxiosInstance>('axios')
const route = useRoute()
const group = ref<Record<string, any> | null>(null)
const isLoading = ref(true)
const showError = ref(false)

const loadGroup = (id) => {
  isLoading.value = true
  axios
    .get(`/groups/${id}`, { params: { include_members: true } })
    .then((response) => {
      group.value = response.data
      isLoading.value = false
    })
    .catch(() => {
      showError.value = true
      isLoading.value = false
    })
}

loadGroup(route.params.id)

const useDefaultAvatar = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img.src.endsWith(defaultAvatar)) return
  img.src = defaultAvatar
}

const meetingLine = () => {
  if (!group.value) return ''
  const start = group.value.meetingStartTime ? String(group.value.meetingStartTime).slice(0, 5) : ''
  return [group.value.meetingDay, group.value.meetingFrequency, start, group.value.meetingLocation].filter(Boolean).join(' · ')
}
</script>

<template>
  <Toaster message="Couldn't retrieve this group." type="error" :show="showError" @close="showError = false"></Toaster>
  <div class="app-page">
    <div class="app-page-header">
      <router-link class="inline-flex shrink-0 text-gray-600 no-underline hover:text-sky-600" :to="{ name: 'groups' }" aria-label="Back to groups">
        <svg class="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z"></path></svg>
      </router-link>
      <h1 class="grow min-w-0">
        <Skeletor v-if="isLoading" width="180"></Skeletor>
        <template v-else>{{ group?.name }}</template>
      </h1>
      <span v-if="group?.status" class="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium capitalize text-sky-800">{{ group.status }}</span>
    </div>
    <div class="app-detail-grid" v-if="group">
      <div class="app-detail-primary">
        <div class="app-panel">
          <div class="app-panel-pad py-6">
            <h2>Members</h2>
          </div>
          <div v-if="!group.members?.length" class="app-panel-pad pb-6 text-sm text-gray-400">No members yet.</div>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="member in group.members" :key="member.person.id" class="flex items-center gap-3 px-4 py-3 sm:px-6">
              <UserProfilePopup :person="member.person">
                <span class="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                  <img class="h-full w-full object-cover" v-if="member.person.profileImage" :src="getPersonImageUrl(member.person)" alt="" @error="useDefaultAvatar">
                  <img class="h-full w-full object-cover" v-else src="@/assets/default-user-profile.png" alt="">
                </span>
              </UserProfilePopup>
              <div class="min-w-0">
                <router-link class="font-medium no-underline" :to="{ name: 'person', params: { id: member.person.id } }">
                  {{ member.person.firstName }} {{ member.person.lastName }}
                </router-link>
                <p class="truncate text-xs text-gray-500">{{ member.role?.name }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="app-detail-aside">
        <div class="app-panel app-panel-pad py-6">
          <h2>About</h2>
          <p v-if="group.category" class="mt-3 text-sm text-gray-600">{{ group.category.name }}</p>
          <p v-if="group.description" class="mt-2 text-sm leading-6 text-gray-600">{{ group.description }}</p>
          <p v-if="meetingLine()" class="mt-3 text-sm text-gray-700">{{ meetingLine() }}</p>
          <p v-if="group.contactEmail" class="mt-3 break-all text-sm text-gray-600">{{ group.contactEmail }}</p>
          <p v-if="group.contactPhone" class="break-all text-sm text-gray-600">{{ group.contactPhone }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
