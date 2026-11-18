<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, ref } from 'vue'
import { useRoute } from 'vue-router'
import Button from '@/components/Forms/Button.vue'
import PersonSearch, { type PersonHit } from '@/components/people/PersonSearch.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import Toaster from '@/components/Widgets/Toaster.vue'

const axios = inject<AxiosInstance>('axios')!
const route = useRoute()

const ministry = ref<Record<string, any> | null>(null)
const unassigned = ref<Record<string, any>[]>([])
const isLoading = ref(true)
const showError = ref(false)
const notice = ref('')
const actionError = ref('')
const addingLeader = ref(false)
const pickedLeader = ref<PersonHit | null>(null)
const roleName = ref('')
const renaming = ref(false)
const editing = ref(false)
const saving = ref(false)
const draft = ref({ name: '', description: '' })
const addingGroup = ref(false)
const groupMode = ref<'new' | 'existing'>('new')
const groupDraft = ref({ name: '', description: '' })
const existingGroupId = ref<number | ''>('')

const messageOf = (err: unknown, fallback: string) => {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

const loadUnassigned = () => {
  axios.get('/groups', { params: { unassigned: true, page: 1, page_size: 100 } }).then((response) => {
    unassigned.value = response.data.items || []
  }).catch(() => {
    unassigned.value = []
  })
}

const loadMinistry = (id) => {
  isLoading.value = true
  axios
    .get(`/departments/${id}`)
    .then((response) => {
      ministry.value = response.data
      roleName.value = response.data.leaderRole?.name || ''
      isLoading.value = false
    })
    .catch(() => {
      showError.value = true
      isLoading.value = false
    })
  loadUnassigned()
}

loadMinistry(route.params.id)

const leaderIds = () => (ministry.value?.leaders || []).map((person: { personId: number }) => person.personId)

const addLeader = async () => {
  if (!ministry.value || !pickedLeader.value) return
  addingLeader.value = true
  try {
    const response = await axios.post(`/departments/${ministry.value.id}/leaders`, { personId: pickedLeader.value.id })
    ministry.value = response.data
    pickedLeader.value = null
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't add that leader.")
  } finally {
    addingLeader.value = false
  }
}

const removeLeader = async (personId: number, name: string) => {
  if (!ministry.value || !confirm(`Remove ${name} as a leader of this ministry?`)) return
  try {
    const response = await axios.delete(`/departments/${ministry.value.id}/leaders/${personId}`)
    ministry.value = response.data
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't remove that leader.")
  }
}

const saveRoleName = async () => {
  if (!ministry.value || !roleName.value.trim()) return
  renaming.value = true
  try {
    const response = await axios.patch(`/departments/${ministry.value.id}/leader-role`, { name: roleName.value.trim() })
    ministry.value = response.data
    roleName.value = response.data.leaderRole?.name || roleName.value
    notice.value = 'Role renamed.'
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't rename that role.")
  } finally {
    renaming.value = false
  }
}

const openEdit = () => {
  if (!ministry.value) return
  draft.value = {
    name: ministry.value.name || '',
    description: ministry.value.description || '',
  }
  editing.value = true
}

const saveMinistry = async () => {
  if (!ministry.value || !draft.value.name.trim()) {
    actionError.value = 'A ministry needs a name.'
    return
  }
  saving.value = true
  try {
    const response = await axios.put(`/departments/${ministry.value.id}`, {
      name: draft.value.name.trim(),
      description: draft.value.description.trim() || null,
    })
    ministry.value = response.data
    editing.value = false
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't save this ministry.")
  } finally {
    saving.value = false
  }
}

const openAddGroup = () => {
  groupMode.value = 'new'
  groupDraft.value = { name: '', description: '' }
  existingGroupId.value = ''
  addingGroup.value = true
}

const closeAddGroup = () => {
  addingGroup.value = false
}

const submitGroup = () => {
  if (groupMode.value === 'existing') {
    assignExisting()
    return
  }
  createGroup()
}

const createGroup = async () => {
  if (!ministry.value || !groupDraft.value.name.trim()) {
    actionError.value = 'A group needs a name.'
    return
  }
  saving.value = true
  try {
    const response = await axios.post(`/departments/${ministry.value.id}/groups`, {
      name: groupDraft.value.name.trim(),
      description: groupDraft.value.description.trim() || null,
    })
    ministry.value = response.data
    groupDraft.value = { name: '', description: '' }
    closeAddGroup()
    loadUnassigned()
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't create that group.")
  } finally {
    saving.value = false
  }
}

const assignExisting = async () => {
  if (!ministry.value || !existingGroupId.value) return
  try {
    const response = await axios.post(`/departments/${ministry.value.id}/groups`, { groupId: Number(existingGroupId.value) })
    ministry.value = response.data
    existingGroupId.value = ''
    closeAddGroup()
    loadUnassigned()
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't assign that group.")
  }
}

const unassignGroup = async (groupId: number, name: string) => {
  if (!ministry.value || !confirm(`Remove ${name} from this ministry? The group itself stays.`)) return
  try {
    const response = await axios.delete(`/departments/${ministry.value.id}/groups/${groupId}`)
    ministry.value = response.data
    loadUnassigned()
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't remove that group.")
  }
}
</script>

<template>
  <Toaster message="Couldn't retrieve this ministry." type="error" :show="showError" @close="showError = false"></Toaster>
  <Toaster :message="notice" type="success" :show="Boolean(notice)" @close="notice = ''"></Toaster>
  <Toaster :message="actionError" type="error" :show="Boolean(actionError)" @close="actionError = ''"></Toaster>
  <div class="app-page">
    <div class="app-page-header">
      <router-link class="inline-flex shrink-0 text-gray-600 no-underline hover:text-sky-600" :to="{ name: 'ministries' }" aria-label="Back to ministries">
        <svg class="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z"></path></svg>
      </router-link>
      <h1 class="grow min-w-0">
        <Skeletor v-if="isLoading" width="180"></Skeletor>
        <template v-else>{{ ministry?.name }}</template>
      </h1>
      <Button v-if="ministry" stealth @click="openEdit">Edit ministry</Button>
    </div>

    <div class="app-detail-grid" v-if="ministry">
      <div class="app-detail-primary space-y-4">
        <div class="app-panel">
          <div class="app-panel-pad flex items-start justify-between gap-3 py-5">
            <div>
              <h2>Groups</h2>
              <p class="mt-1 text-sm text-gray-500">Rosters that belong to this ministry.</p>
            </div>
            <Button @click="openAddGroup">Add group</Button>
          </div>
          <div v-if="!ministry.groups?.length" class="app-panel-pad pb-6 text-sm text-gray-400">No groups yet.</div>
          <ul v-else class="divide-y divide-gray-100 border-t border-gray-100">
            <li v-for="group in ministry.groups" :key="group.id" class="px-4 py-4 sm:px-6">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <router-link class="font-medium no-underline" :to="{ name: 'group', params: { id: group.id } }">{{ group.name }}</router-link>
                  <p class="text-xs text-gray-500">{{ group.members?.length || 0 }} {{ group.members?.length === 1 ? 'person' : 'people' }}</p>
                </div>
                <button type="button" class="text-sm text-gray-400 hover:text-red-600" @click="unassignGroup(group.id, group.name)">Remove</button>
              </div>
              <ul v-if="group.members?.length" class="mt-3 space-y-1">
                <li v-for="person in group.members" :key="person.personId" class="text-sm">
                  <router-link class="no-underline" :to="{ name: 'person', params: { id: person.personId } }">{{ person.firstName }} {{ person.lastName }}</router-link>
                  <span v-if="person.role" class="text-gray-400"> · {{ person.role }}</span>
                </li>
              </ul>
              <p v-else class="mt-2 text-sm text-gray-400">No people in this group yet.</p>
            </li>
          </ul>
        </div>
      </div>

      <div class="app-detail-aside space-y-4">
        <div class="app-panel app-panel-pad py-6">
          <h2>{{ ministry.leaderRole?.name || 'Leaders' }}</h2>
          <p class="mt-1 text-sm text-gray-500">People who run this ministry. This is separate from membership of a group.</p>
          <form v-if="ministry.leaderRole" class="mt-3 flex gap-2" @submit.prevent="saveRoleName">
            <input v-model="roleName" class="app-field" aria-label="Role name" />
            <Button type="submit" stealth :show-loader="renaming">Rename</Button>
          </form>
          <ul class="mt-4 space-y-2">
            <li v-for="person in ministry.leaders" :key="person.personId" class="flex items-center gap-2 text-sm">
              <router-link class="min-w-0 grow no-underline" :to="{ name: 'person', params: { id: person.personId } }">{{ person.firstName }} {{ person.lastName }}</router-link>
              <button type="button" class="text-gray-400 hover:text-red-600" @click="removeLeader(person.personId, `${person.firstName} ${person.lastName}`)">Remove</button>
            </li>
          </ul>
          <div class="mt-4 space-y-2">
            <PersonSearch inline :exclude-ids="leaderIds()" @select="pickedLeader = $event" />
            <p v-if="pickedLeader" class="text-sm text-gray-700">{{ pickedLeader.firstName }} {{ pickedLeader.lastName }}</p>
            <Button :show-loader="addingLeader" :disabled="!pickedLeader" @click="addLeader">Add leader</Button>
          </div>
        </div>
        <div v-if="ministry.description" class="app-panel app-panel-pad py-6">
          <h2>About</h2>
          <p class="mt-2 text-sm leading-6 text-gray-600">{{ ministry.description }}</p>
        </div>
      </div>
    </div>
  </div>

  <Dialog :show="editing" title="Edit ministry" :is-form="true" @close="editing = false" @submit="saveMinistry">
    <div class="space-y-3">
      <label class="block text-sm"><span class="app-label">Name</span><input v-model="draft.name" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Description</span><textarea v-model="draft.description" class="app-field" rows="3"></textarea></label>
      <p class="text-xs text-gray-500">Renaming the ministry leaves the leader role name as it is. Rename the role on the ministry page.</p>
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="editing = false">Cancel</Button></div>
        <Button type="submit" :show-loader="saving">Save</Button>
      </div>
    </template>
  </Dialog>

  <Dialog :show="addingGroup" title="Add group" size="lg" :is-form="true" @close="closeAddGroup" @submit="submitGroup">
    <div class="space-y-4">
      <div v-if="unassigned.length" class="app-segmented">
        <button type="button" :class="{ 'is-active': groupMode === 'new' }" @click="groupMode = 'new'">New group</button>
        <button type="button" :class="{ 'is-active': groupMode === 'existing' }" @click="groupMode = 'existing'">Existing group</button>
      </div>
      <div v-if="groupMode === 'new'" class="space-y-3">
        <p class="text-sm text-gray-500">This group will belong to {{ ministry?.name }}.</p>
        <label class="block text-sm"><span class="app-label">Name</span><input v-model="groupDraft.name" class="app-field" /></label>
        <label class="block text-sm"><span class="app-label">Description</span><textarea v-model="groupDraft.description" class="app-field" rows="2"></textarea></label>
      </div>
      <div v-else class="space-y-2">
        <p class="text-sm text-gray-500">These groups are not in a ministry yet.</p>
        <label
          v-for="group in unassigned"
          :key="group.id"
          class="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm"
          :class="existingGroupId === group.id ? 'border-sky-500 bg-sky-50' : 'border-gray-200'"
        >
          <input v-model="existingGroupId" type="radio" name="existing-group" :value="group.id" />
          <span class="text-gray-800">{{ group.name }}</span>
        </label>
      </div>
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth type="button" @click="closeAddGroup">Cancel</Button></div>
        <Button type="submit" :show-loader="saving" :disabled="groupMode === 'existing' && !existingGroupId">
          {{ groupMode === 'existing' ? 'Add to ministry' : 'Create group' }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>
