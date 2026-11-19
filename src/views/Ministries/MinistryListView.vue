<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/Forms/Button.vue'
import PersonAvatar from '@/components/people/PersonAvatar.vue'
import PersonSearch, { type PersonHit } from '@/components/people/PersonSearch.vue'
import UserProfilePopup from '@/components/people/UserProfilePopup.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import Toaster from '@/components/Widgets/Toaster.vue'

const axios = inject<AxiosInstance>('axios')!
const router = useRouter()

const ministries = ref<Record<string, any>[]>([])
const isLoading = ref(false)
const showError = ref(false)
const errorMessage = ref("Couldn't load ministries. Please try again.")
const creating = ref(false)
const isSaving = ref(false)
const leader = ref<PersonHit | null>(null)
const draft = reactive({
  name: '',
  description: '',
  groupNames: [''],
})

const messageOf = (err: unknown, fallback: string) => {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

const loadMinistries = () => {
  isLoading.value = true
  axios
    .get('/departments')
    .then((response) => {
      ministries.value = response.data || []
      isLoading.value = false
    })
    .catch(() => {
      errorMessage.value = "Couldn't load ministries. Please try again."
      showError.value = true
      isLoading.value = false
    })
}

loadMinistries()

const resetDraft = () => {
  draft.name = ''
  draft.description = ''
  draft.groupNames = []
  leader.value = null
}

const openCreate = () => {
  resetDraft()
  creating.value = true
}

const closeCreate = () => {
  creating.value = false
  resetDraft()
}

const addGroupRow = () => {
  draft.groupNames.push('')
}

const removeGroupRow = (index: number) => {
  draft.groupNames.splice(index, 1)
}

const createMinistry = async () => {
  if (isSaving.value) return
  if (!draft.name.trim() || !leader.value) {
    errorMessage.value = 'A ministry needs a name and a leader.'
    showError.value = true
    return
  }
  isSaving.value = true
  try {
    const response = await axios.post('/departments', {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      leaderPersonId: leader.value.id,
      groupNames: draft.groupNames.map((name) => name.trim()).filter(Boolean),
    })
    router.push({ name: 'ministry', params: { id: response.data.id } })
  } catch (err) {
    errorMessage.value = messageOf(err, "Couldn't create this ministry.")
    showError.value = true
    isSaving.value = false
  }
}
</script>

<template>
  <Toaster :message="errorMessage" type="error" :show="showError" @close="showError = false"></Toaster>
  <div class="app-page">
    <div class="app-page-header">
      <h1 class="grow min-w-0">Ministries</h1>
      <Button @click="openCreate">Add ministry</Button>
    </div>

    <div class="app-page-section" v-if="!isLoading && ministries.length === 0">
      <div class="app-empty-state">
        <div>
          <p class="font-medium text-gray-800">No ministries yet</p>
          <p class="mt-1 text-sm text-gray-500">Create a ministry such as Bible Study, Fundamentals of the Faith, or Elders. Groups are added inside it.</p>
        </div>
      </div>
    </div>

    <div class="app-page-section" v-if="ministries.length > 0">
      <div class="app-panel">
        <div class="app-table-wrap">
          <table class="app-data-table min-w-[40rem]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Leader</th>
                <th>Groups</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ministry in ministries" :key="ministry.id">
                <td>
                  <router-link class="font-medium no-underline" :to="{ name: 'ministry', params: { id: ministry.id } }">{{ ministry.name }}</router-link>
                  <p v-if="ministry.leaderRole?.name" class="mt-0.5 text-xs text-gray-400">{{ ministry.leaderRole.name }}</p>
                </td>
                <td class="text-gray-600">
                  <div v-if="ministry.leaders?.length" class="flex flex-col gap-1.5">
                    <UserProfilePopup v-for="person in ministry.leaders" :key="person.personId" :person="{ ...person, id: person.personId }">
                      <span class="inline-flex min-w-0 items-center gap-2">
                        <PersonAvatar :person="person" />
                        <span class="truncate text-sm font-medium text-gray-800">{{ person.firstName }} {{ person.lastName }}</span>
                      </span>
                    </UserProfilePopup>
                  </div>
                </td>
                <td class="text-gray-600">{{ ministry.groupCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <Dialog :show="creating" title="Add ministry" size="lg" :is-form="true" @close="closeCreate" @submit="createMinistry">
    <div class="space-y-4">
      <p class="text-sm text-gray-500">Name the ministry and who leads it. Groups are optional and can be added afterwards.</p>
      <label class="block text-sm">
        <span class="app-label">Name</span>
        <input v-model="draft.name" class="app-field" required />
      </label>
      <label class="block text-sm">
        <span class="app-label">Description</span>
        <textarea v-model="draft.description" class="app-field" rows="2"></textarea>
      </label>
      <div class="text-sm">
        <span class="app-label">Leader</span>
        <div v-if="leader" class="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2">
          <PersonAvatar :person="leader" />
          <span class="min-w-0 grow text-gray-800">{{ leader.firstName }} {{ leader.lastName }}</span>
          <button type="button" class="text-sm text-gray-500 hover:text-gray-800" @click="leader = null">Change</button>
        </div>
        <PersonSearch v-else inline @select="leader = $event" />
      </div>
      <div class="text-sm">
        <span class="app-label">Groups</span>
        <p v-if="draft.groupNames.length === 0" class="text-gray-500">None yet. A group created here belongs to this ministry.</p>
        <div v-else class="space-y-2">
          <div v-for="(name, index) in draft.groupNames" :key="index" class="flex items-center gap-2">
            <input v-model="draft.groupNames[index]" class="app-field" placeholder="Group name" />
            <button type="button" class="shrink-0 text-sm text-gray-400 hover:text-red-600" @click="removeGroupRow(index)">Remove</button>
          </div>
        </div>
        <button type="button" class="mt-2 text-sm font-medium text-sky-700" @click="addGroupRow">Add a group</button>
      </div>
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth type="button" @click="closeCreate">Cancel</Button></div>
        <Button type="submit" :show-loader="isSaving">Create ministry</Button>
      </div>
    </template>
  </Dialog>
</template>
