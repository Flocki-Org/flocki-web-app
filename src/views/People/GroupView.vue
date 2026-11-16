<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserProfilePopup from '@/components/people/UserProfilePopup.vue'
import PersonSearch, { type PersonHit } from '@/components/people/PersonSearch.vue'
import Toaster from '@/components/Widgets/Toaster.vue'
import Button from '@/components/Forms/Button.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import { eventsApi, type EventSeries } from '@/api/events'
import { getPersonImageUrl } from '@/imageUtils'
import defaultAvatar from '@/assets/default-user-profile.png'

const axios = inject<AxiosInstance>('axios')!
const route = useRoute()
const router = useRouter()
const group = ref<Record<string, any> | null>(null)
const series = ref<EventSeries[]>([])
const tab = ref<'members' | 'events'>('members')
const isLoading = ref(true)
const showError = ref(false)
const notice = ref('')
const actionError = ref('')
const roles = ref<{ id: number; name: string }[]>([])
const categories = ref<{ id: number; name: string }[]>([])
const editing = ref(false)
const saving = ref(false)
const adding = ref(false)
const picked = ref<PersonHit | null>(null)
const roleName = ref('Member')
const draft = ref({
  name: '',
  description: '',
  categoryId: '' as number | '',
  status: 'active',
  contactEmail: '',
  contactPhone: '',
})

const messageOf = (err: unknown, fallback: string) => {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

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
  eventsApi.seriesList({ groupId: Number(id) }).then((rows) => {
    series.value = rows
  })
}

loadGroup(route.params.id)
axios.get('/groups/roles').then((response) => {
  roles.value = response.data || []
}).catch(() => {
  roles.value = []
})
axios.get('/groups/categories').then((response) => {
  categories.value = response.data || []
}).catch(() => {
  categories.value = []
})

const useDefaultAvatar = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img.src.endsWith(defaultAvatar)) return
  img.src = defaultAvatar
}

const openEdit = () => {
  if (!group.value) return
  draft.value = {
    name: group.value.name || '',
    description: group.value.description || '',
    categoryId: group.value.category?.id || '',
    status: group.value.status || 'active',
    contactEmail: group.value.contactEmail || '',
    contactPhone: group.value.contactPhone || '',
  }
  editing.value = true
}

const saveGroup = async () => {
  if (!group.value || !draft.value.name.trim()) {
    actionError.value = 'A group needs a name.'
    return
  }
  saving.value = true
  try {
    const response = await axios.patch(`/groups/${group.value.id}`, {
      name: draft.value.name.trim(),
      description: draft.value.description.trim() || null,
      categoryId: draft.value.categoryId ? Number(draft.value.categoryId) : null,
      status: draft.value.status,
      contactEmail: draft.value.contactEmail.trim() || null,
      contactPhone: draft.value.contactPhone.trim() || null,
    })
    group.value = { ...response.data, members: group.value.members }
    editing.value = false
    notice.value = 'Group saved.'
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't save this group.")
  } finally {
    saving.value = false
  }
}

const memberIds = () => (group.value?.members || []).map((member: { person: { id: number } }) => member.person.id)

const addMember = async () => {
  if (!group.value || !picked.value) return
  adding.value = true
  actionError.value = ''
  try {
    await axios.post(`/groups/${group.value.id}/members`, {
      personId: picked.value.id,
      roleName: roleName.value || 'Member',
    })
    picked.value = null
    notice.value = 'Person added.'
    loadGroup(group.value.id)
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't add that person.")
  } finally {
    adding.value = false
  }
}

const changeRole = async (personId: number, nextRole: string) => {
  if (!group.value) return
  try {
    await axios.put(`/groups/${group.value.id}/members/${personId}`, { roleName: nextRole })
    notice.value = 'Role updated.'
    loadGroup(group.value.id)
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't change that role.")
  }
}

const removeMember = async (personId: number, name: string) => {
  if (!group.value || !confirm(`Remove ${name} from this group?`)) return
  try {
    await axios.delete(`/groups/${group.value.id}/members/${personId}`)
    notice.value = 'Person removed.'
    loadGroup(group.value.id)
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't remove that person.")
  }
}

const addEvent = () => {
  if (!group.value) return
  router.push({ name: 'events', query: { group: String(group.value.id), create: '1' } })
}
</script>

<template>
  <Toaster message="Couldn't retrieve this group." type="error" :show="showError" @close="showError = false"></Toaster>
  <Toaster :message="notice" type="success" :show="Boolean(notice)" @close="notice = ''"></Toaster>
  <Toaster :message="actionError" type="error" :show="Boolean(actionError)" @close="actionError = ''"></Toaster>
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
      <Button v-if="group" stealth @click="openEdit">Edit group</Button>
    </div>
    <div class="app-detail-grid" v-if="group">
      <div class="app-detail-primary">
        <div class="app-panel">
          <div class="app-panel-pad flex items-center gap-2 py-4">
            <div class="app-segmented">
              <button type="button" :class="{ 'is-active': tab === 'members' }" @click="tab = 'members'">Members</button>
              <button type="button" :class="{ 'is-active': tab === 'events' }" @click="tab = 'events'">Events</button>
            </div>
          </div>
          <template v-if="tab === 'events'">
            <div class="app-panel-pad flex items-center justify-between gap-3 pb-4">
              <p class="text-sm text-gray-500">Events linked to this group.</p>
              <Button @click="addEvent">Add event</Button>
            </div>
            <p v-if="series.length === 0" class="app-panel-pad pb-6 text-sm text-gray-400">This group has no events yet.</p>
            <ul v-else class="divide-y divide-gray-100">
              <li v-for="item in series" :key="item.id" class="px-4 py-3 sm:px-6">
                <router-link v-if="item.nextDate" class="font-medium no-underline" :to="{ name: 'event-occurrence', params: { seriesId: item.id, date: item.nextDate } }">{{ item.title }}</router-link>
                <p v-else class="font-medium text-gray-900">{{ item.title }}</p>
                <p class="text-xs text-gray-500">{{ item.scheduleLabel }}</p>
              </li>
            </ul>
          </template>
          <template v-else>
            <div class="app-panel-pad space-y-3 border-b border-gray-100 pb-4">
              <p class="text-sm font-medium text-gray-700">Add a person</p>
              <PersonSearch :exclude-ids="memberIds()" @select="picked = $event" />
              <p v-if="picked" class="text-sm text-gray-700">{{ picked.firstName }} {{ picked.lastName }}</p>
              <div class="flex flex-wrap items-center gap-2">
                <select v-model="roleName" class="app-field max-w-48" aria-label="Role">
                  <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.name }}</option>
                  <option v-if="roles.length === 0" value="Member">Member</option>
                </select>
                <Button :show-loader="adding" :disabled="!picked" @click="addMember">Add to group</Button>
              </div>
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
                <div class="min-w-0 grow">
                  <router-link class="font-medium no-underline" :to="{ name: 'person', params: { id: member.person.id } }">
                    {{ member.person.firstName }} {{ member.person.lastName }}
                  </router-link>
                </div>
                <select class="app-field max-w-44" :value="member.role?.name" aria-label="Member role" @change="changeRole(member.person.id, ($event.target as HTMLSelectElement).value)">
                  <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.name }}</option>
                </select>
                <button type="button" class="text-sm text-gray-400 hover:text-red-600" @click="removeMember(member.person.id, `${member.person.firstName} ${member.person.lastName}`)">Remove</button>
              </li>
            </ul>
          </template>
        </div>
      </div>
      <div class="app-detail-aside">
        <div class="app-panel app-panel-pad py-6">
          <h2>About</h2>
          <p v-if="group.category" class="mt-3 text-sm text-gray-600">{{ group.category.name }}</p>
          <p v-if="group.description" class="mt-2 text-sm leading-6 text-gray-600">{{ group.description }}</p>
          <p v-if="series.length" class="mt-3 text-sm text-gray-700">{{ series.map((item) => item.scheduleLabel).join(' · ') }}</p>
          <p v-if="group.contactEmail" class="mt-3 break-all text-sm text-gray-600">{{ group.contactEmail }}</p>
          <p v-if="group.contactPhone" class="break-all text-sm text-gray-600">{{ group.contactPhone }}</p>
        </div>
      </div>
    </div>
  </div>
  <Dialog :show="editing" title="Edit group" :is-form="true" @close="editing = false" @submit="saveGroup">
    <div class="space-y-3">
      <label class="block text-sm"><span class="app-label">Name</span><input v-model="draft.name" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Description</span><textarea v-model="draft.description" class="app-field" rows="3"></textarea></label>
      <label class="block text-sm">
        <span class="app-label">Category</span>
        <select v-model="draft.categoryId" class="app-field">
          <option value="">None</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="app-label">Status</span>
        <select v-model="draft.status" class="app-field">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <label class="block text-sm"><span class="app-label">Contact email</span><input v-model="draft.contactEmail" type="email" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Contact phone</span><input v-model="draft.contactPhone" class="app-field" /></label>
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="editing = false">Cancel</Button></div>
        <Button type="submit" :show-loader="saving">Save</Button>
      </div>
    </template>
  </Dialog>
</template>
