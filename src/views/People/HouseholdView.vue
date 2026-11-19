<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useRepo } from 'pinia-orm'
import Toaster from '@/components/Widgets/Toaster.vue'
import ImageCropperUploader from '../../components/ImageCropperUploader.vue'
import { getHouseholdImageUrl } from '@/imageUtils'
import CachedImage from '@/components/CachedImage.vue'
import PersonAvatar from '@/components/people/PersonAvatar.vue'
import Household from '@/models/Household'
import AddressDisplay from '../../components/AddressDisplay.vue'
import AddressMap from '@/components/AddressMap.vue'
import UserProfilePopup from '../../components/people/UserProfilePopup.vue'
import Button from '@/components/Forms/Button.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import PersonSearch, { type PersonHit } from '@/components/people/PersonSearch.vue'

const axios = inject<AxiosInstance>('axios')!
const route = useRoute()

const isLoadingHousehold = ref(true)
const showLoadingError = ref(false)
const household = ref<Household | null>(null)
const actionError = ref('')
const savedNotice = ref(false)

const dropdownVisible = ref(false)
const householdImageViewVisible = ref(false)
const uploadHouseholdImage = ref(false)
const uploadHouseholdImageFailed = ref(false)
const uploadHouseholdImageSuccess = ref(false)

const addingMember = ref(false)
const savingMember = ref(false)
const memberError = ref('')
const pickedMember = ref<PersonHit | null>(null)

const editing = ref(false)
const savingEdit = ref(false)
const editError = ref('')
const draft = ref(emptyDraft())

const householdTitle = computed(() => {
  if (!household.value) return 'Household'
  return household.value.name || `${household.value.leader?.lastName || 'This'} household`
})

const memberIds = computed(() => (household.value?.people || []).map((person) => person.id).filter(Boolean))

function emptyDraft() {
  return {
    name: '',
    notes: '',
    leaderId: null as number | null,
    streetNumber: '',
    street: '',
    suburb: '',
    city: '',
    province: '',
    country: 'South Africa',
    postalCode: '',
  }
}

function errorMessage(error: unknown, fallback: string) {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item?.msg || String(item)).join(' ')
  return fallback
}

const loadHousehold = (id: unknown) => {
  isLoadingHousehold.value = true
  axios
    .get('/households/' + id)
    .then((response) => {
      useRepo(Household).save(response.data)
      household.value = useRepo(Household).find(+id) as Household
      isLoadingHousehold.value = false
    })
    .catch(() => {
      showLoadingError.value = true
      isLoadingHousehold.value = false
    })
}

loadHousehold(route.params.id)
onBeforeRouteUpdate((to) => loadHousehold(to.params.id))

const openEdit = () => {
  const current = household.value
  const address = current?.address
  draft.value = {
    name: current?.name || '',
    notes: current?.notes || '',
    leaderId: current?.leader?.id ?? null,
    streetNumber: address?.streetNumber || '',
    street: address?.street || '',
    suburb: address?.suburb || '',
    city: address?.city || '',
    province: address?.province || '',
    country: address?.country || 'South Africa',
    postalCode: address?.postalCode || '',
  }
  editError.value = ''
  editing.value = true
}

const saveEdit = async () => {
  const current = household.value
  if (!current) return
  const next = draft.value
  if (!next.streetNumber || !next.street || !next.suburb || !next.city || !next.province || !next.country) {
    editError.value = 'Street number, street, suburb, city, province and country are required.'
    return
  }
  if (!next.leaderId) {
    editError.value = 'Choose a household leader.'
    return
  }
  savingEdit.value = true
  editError.value = ''
  try {
    const addressPayload = {
      id: current.address?.id,
      type: current.address?.type || 'home',
      streetNumber: next.streetNumber,
      street: next.street,
      suburb: next.suburb,
      city: next.city,
      province: next.province,
      country: next.country,
      postalCode: next.postalCode || null,
    }
    let addressId = current.address?.id
    if (addressId) {
      await axios.put(`/addresses/?id=${addressId}`, addressPayload)
    } else {
      const created = await axios.post('/addresses', addressPayload)
      addressId = created.data.id
    }
    await axios.put(`/households?id=${current.id}`, {
      id: current.id,
      addressId,
      peopleIds: (current.people || []).map((person) => person.id),
      leaderId: next.leaderId,
      name: next.name.trim() || null,
      notes: next.notes.trim() || null,
    })
    editing.value = false
    savedNotice.value = true
    setTimeout(() => { savedNotice.value = false }, 3000)
    loadHousehold(current.id)
  } catch (error) {
    editError.value = errorMessage(error, 'Could not save the household.')
  } finally {
    savingEdit.value = false
  }
}

const addMember = async () => {
  if (!household.value || !pickedMember.value) {
    memberError.value = 'Choose a person to add.'
    return
  }
  savingMember.value = true
  memberError.value = ''
  try {
    await axios.post(`/households/${household.value.id}/members`, null, { params: { person_id: pickedMember.value.id } })
    addingMember.value = false
    pickedMember.value = null
    loadHousehold(household.value.id)
  } catch (error) {
    memberError.value = errorMessage(error, 'Could not add that person.')
  } finally {
    savingMember.value = false
  }
}

const promoteMember = async (memberId: number, name: string) => {
  if (!household.value || household.value.leader?.id === memberId) return
  if (!confirm(`Make ${name} the household leader?`)) return
  actionError.value = ''
  try {
    await axios.put(`/households/${household.value.id}/leader`, null, { params: { person_id: memberId } })
    loadHousehold(household.value.id)
  } catch (error) {
    actionError.value = errorMessage(error, 'Could not change the leader.')
  }
}

const removeMember = async (memberId: number, name: string) => {
  if (!household.value) return
  if (household.value.leader?.id === memberId) {
    actionError.value = 'Choose another leader before removing this person.'
    return
  }
  if (!confirm(`Remove ${name} from this household?`)) return
  actionError.value = ''
  try {
    await axios.delete(`/households/${household.value.id}/members/${memberId}`)
    loadHousehold(household.value.id)
  } catch (error) {
    actionError.value = errorMessage(error, 'Could not remove that person.')
  }
}

const personName = (person: { preferredName?: string | null; firstName?: string | null; lastName?: string | null }) => {
  const first = person.preferredName || person.firstName || ''
  return [first, person.lastName].filter(Boolean).join(' ')
}

const toggleDropdown = () => { dropdownVisible.value = !dropdownVisible.value }
const viewHouseholdImage = () => { householdImageViewVisible.value = true }
const closeHouseholdImageView = () => { householdImageViewVisible.value = false }
const viewUploadHouseholdImage = () => { uploadHouseholdImage.value = true }
const closeUploadHouseholdImageView = () => { uploadHouseholdImage.value = false }
const handleImageUploadedSuccess = () => {
  uploadHouseholdImage.value = false
  uploadHouseholdImageSuccess.value = true
  setTimeout(() => { uploadHouseholdImageSuccess.value = false }, 3000)
  if (household.value) loadHousehold(household.value.id)
}
const handleImageUploadFailed = () => {
  uploadHouseholdImage.value = false
  uploadHouseholdImageFailed.value = true
}
</script>

<template>
  <Toaster message="Couldn't retrieve the household. Please try again later." type="error" :show="showLoadingError" @close="showLoadingError = false" />
  <Toaster message="Uploading of household image failed" type="error" :show="uploadHouseholdImageFailed" @close="uploadHouseholdImageFailed = false" />
  <Toaster message="New household image uploaded" type="success" :show="uploadHouseholdImageSuccess" @close="uploadHouseholdImageSuccess = false" />
  <Toaster message="Household saved" type="success" :show="savedNotice" @close="savedNotice = false" />

  <div class="app-page">
    <div class="app-page-header">
      <router-link class="inline-flex shrink-0 text-gray-600 no-underline transition-all hover:text-sky-500" :to="{ name: 'households' }" aria-label="Back to households">
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z" />
        </svg>
      </router-link>
      <div class="min-w-0 grow">
        <h1 class="break-words text-gray-700">
          <Skeletor v-if="isLoadingHousehold" width="220" />
          <template v-else>{{ householdTitle }}</template>
        </h1>
        <p v-if="household?.leader" class="text-sm text-gray-500">Led by {{ personName(household.leader) }}</p>
      </div>
      <button type="button" class="app-link-btn" @click="openEdit">Edit</button>
    </div>

    <p v-if="actionError" class="mx-main-lr mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ actionError }}</p>

    <div v-if="household" class="app-detail-grid">
      <div class="app-detail-primary order-2 lg:order-1 lg:w-1/2">
        <section class="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div class="flex items-center gap-3 app-panel-pad py-6">
            <h2 class="grow text-gray-700">People</h2>
            <button type="button" class="app-link-btn" @click="addingMember = true; pickedMember = null; memberError = ''">Add person</button>
          </div>
          <ul class="flex flex-row flex-wrap gap-3 app-panel-pad pb-6">
            <li v-for="member in household.people" :key="member.id" class="flex w-40 shrink-0 flex-col items-center rounded-xl border border-gray-100 bg-gray-50 px-3 py-4 text-center">
              <UserProfilePopup :person="member" :include-name="false">
                <PersonAvatar :person="member" size="xl" />
              </UserProfilePopup>
              <router-link class="mt-2 text-sm font-medium text-gray-800 no-underline hover:text-sky-600" :to="{ name: 'person', params: { id: member.id } }">{{ personName(member) }}</router-link>
              <p v-if="member.id === household.leader?.id" class="mt-1 text-xs font-medium text-sky-600">Leader</p>
              <div v-else class="mt-2 flex flex-col gap-1">
                <button type="button" class="text-xs text-sky-600 hover:text-sky-800" @click="promoteMember(member.id, personName(member))">Make leader</button>
                <button type="button" class="text-xs text-gray-400 hover:text-red-600" @click="removeMember(member.id, personName(member))">Remove</button>
              </div>
            </li>
          </ul>
          <p v-if="household.notes" class="app-panel-pad pb-6 text-sm whitespace-pre-wrap text-gray-600">{{ household.notes }}</p>
        </section>

        <section class="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div class="flex items-center gap-3 app-panel-pad py-6">
            <h2 class="grow text-gray-700">Address</h2>
            <button type="button" class="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-400 hover:bg-gray-50" aria-label="Edit address" @click="openEdit">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" /></svg>
            </button>
          </div>
          <div v-if="household.address" class="app-panel-pad pb-6 text-sm text-gray-600">
            <AddressDisplay :address="household.address" addressFormat="[[streetNumber]] [[street]] [[newline]] [[suburb]], [[city]], [[postalCode]] [[newline]] [[province]], [[country]]" />
            <AddressMap :address="household.address" />
          </div>
          <p v-else class="app-panel-pad pb-6 text-sm text-gray-400">No address yet.</p>
        </section>
      </div>

      <aside class="app-detail-aside order-1 lg:order-2 lg:w-1/2">
        <div class="overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <button type="button" class="block w-full p-3" @click="toggleDropdown">
            <CachedImage v-if="household.householdImage" class="max-h-[70vh] w-full rounded-lg object-contain" :src="getHouseholdImageUrl(household)" alt="" />
            <img v-else class="max-h-80 w-full rounded-lg object-contain" src="@/assets/default-user-profile.png" alt="">
          </button>
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <p class="text-sm text-gray-500">Household photo</p>
            <button type="button" class="text-sm text-sky-600 hover:text-sky-800" @click="viewUploadHouseholdImage">Change</button>
          </div>
          <div v-if="dropdownVisible" class="border-t border-gray-100">
            <button v-if="household.householdImage" type="button" class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50" @click="viewHouseholdImage">View photo</button>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <div v-if="householdImageViewVisible" class="fixed inset-0 flex items-center justify-center bg-gray-800/75 p-4">
    <div class="relative w-full max-w-3xl overflow-hidden rounded-lg bg-white p-4 shadow-lg">
      <button type="button" class="absolute top-2 right-2 text-2xl text-gray-600" @click="closeHouseholdImageView">×</button>
      <CachedImage :src="getHouseholdImageUrl(household)" class="mx-auto max-h-[70vh] w-auto" alt="Household photo" />
    </div>
  </div>
  <div v-if="uploadHouseholdImage" class="fixed inset-0 flex items-center justify-center bg-gray-800/75 p-4">
    <ImageCropperUploader :aspect-ratio="3 / 2" :upload-endpoint="'/households/household_image?id=' + household?.id" @image-cropper-cancelled="closeUploadHouseholdImageView" @image-cropper-uploaded-success="handleImageUploadedSuccess" @image-cropper-upload-failed="handleImageUploadFailed" />
  </div>

  <Dialog :show="addingMember" title="Add a person" :is-form="true" @close="addingMember = false" @submit="addMember">
    <p v-if="memberError" class="mb-3 text-sm text-red-600">{{ memberError }}</p>
    <PersonSearch :exclude-ids="memberIds" @select="pickedMember = $event" />
    <p v-if="pickedMember" class="mt-3 text-sm text-gray-800">{{ pickedMember.firstName }} {{ pickedMember.lastName }}</p>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="addingMember = false">Cancel</Button></div>
        <Button type="submit" :show-loader="savingMember">Add</Button>
      </div>
    </template>
  </Dialog>

  <Dialog :show="editing" title="Edit household" :is-form="true" size="lg" @close="editing = false" @submit="saveEdit">
    <p v-if="editError" class="mb-3 text-sm text-red-600">{{ editError }}</p>
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block text-sm sm:col-span-2"><span class="app-label">Name</span><input v-model="draft.name" class="app-field" /></label>
      <label class="block text-sm sm:col-span-2"><span class="app-label">Notes</span><textarea v-model="draft.notes" rows="3" class="app-field"></textarea></label>
      <label class="block text-sm sm:col-span-2">
        <span class="app-label">Leader</span>
        <select v-model="draft.leaderId" class="app-field">
          <option v-for="member in household?.people || []" :key="member.id" :value="member.id">{{ personName(member) }}</option>
        </select>
      </label>
      <label class="block text-sm"><span class="app-label">Street number</span><input v-model="draft.streetNumber" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Street</span><input v-model="draft.street" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Suburb</span><input v-model="draft.suburb" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">City</span><input v-model="draft.city" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Province</span><input v-model="draft.province" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Country</span><input v-model="draft.country" class="app-field" /></label>
      <label class="block text-sm sm:col-span-2"><span class="app-label">Postal code</span><input v-model="draft.postalCode" class="app-field" /></label>
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="editing = false">Cancel</Button></div>
        <Button type="submit" :show-loader="savingEdit">Save</Button>
      </div>
    </template>
  </Dialog>
</template>
