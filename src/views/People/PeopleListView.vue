<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { ref, reactive, inject, computed} from 'vue'
import { useRouter } from 'vue-router'
import { useRepo } from 'pinia-orm'
import UserProfilePopup from '../../components/people/UserProfilePopup.vue';

import Button from '@/components/Forms/Button.vue'
import Label from '@/components/Forms/Label.vue'
import Input from '@/components/Forms/Input.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import Toaster from '@/components/Widgets/Toaster.vue'
import Person from '@/models/Person'
import defaultAvatar from '@/assets/default-user-profile.png'
import Paginator from "@/components/Paginator.vue";

const axios = inject<AxiosInstance>('axios')

const router = useRouter()

const isOpenAddPersonDialog = ref(false)
const isCreatingPerson = ref(false)
const isLoadingPeople = ref(false)
const showPeopleLoadingError = ref(false)
const initialFocusRef = ref(null)

const page = ref(1)
const perPage = ref(10)
const total = ref(0)
const totalPages = ref(0)
const searchTerm = ref('')
const statusFilter = ref('')
const selectedIds = ref<number[]>([])
const actionError = ref('')
const actionNotice = ref('')
const showTag = ref(false)
const showHousehold = ref(false)
const categories = ref<{ id: number; name: string }[]>([])
const tagCategoryId = ref<number | ''>('')
const householdName = ref('')
const householdLeaderId = ref<number | ''>('')
const working = ref(false)

const newPerson = reactive({
  firstName: '',
  lastName: '',
  email: '',
  mobileNumber: ''
})

const people = computed(() => {
  return useRepo(Person).all()
})

const compactDate = (value?: string | null) => (value ? dayjs(value).format("D MMM YYYY") : '')

const useDefaultAvatar = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img.src.endsWith(defaultAvatar)) return
  img.src = defaultAvatar
}

const loadPeople = (currentPage, itemsPerPage) => {
  isLoadingPeople.value = true
    const params: Record<string, string | number> = {
      page: currentPage,
      page_size: itemsPerPage,
    }
    const term = searchTerm.value.trim()
    if (term.includes('@')) params.email = term
    else if (term) params.full_name = term
    if (statusFilter.value === 'archived') params.archived = 'true'
    else if (statusFilter.value) params.lifecycle_status = statusFilter.value

    axios
    .get('/people',{
      params,
    })
    .then(response => {
      const personRepo = useRepo(Person);

      personRepo.flush();
      // Save new data
      personRepo.save(response.data.items);

      page.value = response.data.page;
      total.value = response.data.total;
      totalPages.value = Math.ceil( total.value/ response.data.size);
      isLoadingPeople.value = false
    })
    .catch((err) => {
      showPeopleLoadingError.value = true
      isLoadingPeople.value = false
    })
}

loadPeople(1, perPage.value)

const toggleAddPersonDialog = (val: boolean) => {
  isOpenAddPersonDialog.value = val
}

const selectedPeople = computed(() => people.value.filter((person) => selectedIds.value.includes(person.id)))
const allOnPageSelected = computed(() => people.value.length > 0 && people.value.every((person) => selectedIds.value.includes(person.id)))

const togglePerson = (id: number, checked: boolean) => {
  selectedIds.value = checked ? [...new Set([...selectedIds.value, id])] : selectedIds.value.filter((value) => value !== id)
}

const togglePage = (checked: boolean) => {
  const pageIds = people.value.map((person) => person.id)
  selectedIds.value = checked
    ? [...new Set([...selectedIds.value, ...pageIds])]
    : selectedIds.value.filter((id) => !pageIds.includes(id))
}

const requireSelection = () => {
  if (selectedIds.value.length) return true
  actionError.value = 'Select at least one person.'
  return false
}

const archiveSelected = async () => {
  if (!requireSelection() || !confirm(`Archive ${selectedIds.value.length} ${selectedIds.value.length === 1 ? 'person' : 'people'}?`)) return
  working.value = true
  try {
    await Promise.all(selectedIds.value.map((id) => axios.post(`/people/${id}/archive`)))
    selectedIds.value = []
    actionNotice.value = 'Archived.'
    loadPeople(page.value, perPage.value)
  } catch {
    actionError.value = "Couldn't archive the selected people."
  } finally {
    working.value = false
  }
}

const openTag = async () => {
  if (!requireSelection()) return
  if (categories.value.length === 0) {
    const response = await axios.get('/people/categories')
    categories.value = response.data || []
  }
  if (categories.value.length === 0) {
    actionError.value = 'Add a category before tagging people.'
    return
  }
  tagCategoryId.value = categories.value[0].id
  showTag.value = true
}

const applyTag = async () => {
  if (!tagCategoryId.value) return
  working.value = true
  try {
    await Promise.all(selectedIds.value.map(async (id) => {
      const response = await axios.get(`/people/${id}`)
      const categoryId = Number(tagCategoryId.value)
      const ids = (response.data.categories || []).map((category: { id: number }) => category.id)
      if (!ids.includes(categoryId)) ids.push(categoryId)
      await axios.patch(`/people/${id}`, { id, categoryIds: ids })
    }))
    showTag.value = false
    actionNotice.value = 'Category added.'
  } catch {
    actionError.value = "Couldn't tag the selected people."
  } finally {
    working.value = false
  }
}

const openHousehold = () => {
  if (!requireSelection()) return
  householdLeaderId.value = selectedIds.value[0]
  const leader = selectedPeople.value[0]
  householdName.value = leader ? `${leader.lastName} household` : 'Household'
  showHousehold.value = true
}

const createHousehold = async () => {
  if (!householdLeaderId.value) return
  working.value = true
  try {
    const response = await axios.post('/households', {
      name: householdName.value.trim() || null,
      peopleIds: selectedIds.value,
      leaderId: Number(householdLeaderId.value),
    })
    showHousehold.value = false
    await router.push({ name: 'household', params: { id: response.data.id } })
  } catch {
    actionError.value = "Couldn't create that household."
  } finally {
    working.value = false
  }
}

const createPerson = () => {
  if (!isCreatingPerson.value) {
    isCreatingPerson.value = true
    if (newPerson.email == '')
      newPerson.email=null;

    axios
      .post('/people', newPerson, {params: {create_login: false}})
      .then(response => {
        //console.log(response)

        router.push({
          name: 'person',
          params: {
            id: response.data.id
          }
        })
      })
  }
}


</script>

<template>  
  <Toaster message="Couldn't retrieve people. Please try again later." type="error" :show="showPeopleLoadingError" @close="showPeopleLoadingError = false"></Toaster>
  <Toaster :message="actionError" type="error" :show="Boolean(actionError)" @close="actionError = ''"></Toaster>
  <Toaster :message="actionNotice" type="success" :show="Boolean(actionNotice)" @close="actionNotice = ''"></Toaster>
  <div class="app-page" id="people-list">
    <div class="app-page-header">
      <h1 class="grow min-w-0">All People</h1>
      <Button @click="toggleAddPersonDialog(true)">
        <svg class="mr-2" style="width:16px;height:16px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4M15,5.9C16.16,5.9 17.1,6.84 17.1,8C17.1,9.16 16.16,10.1 15,10.1A2.1,2.1 0 0,1 12.9,8A2.1,2.1 0 0,1 15,5.9M4,7V10H1V12H4V15H6V12H9V10H6V7H4M15,13C12.33,13 7,14.33 7,17V20H23V17C23,14.33 17.67,13 15,13M15,14.9C17.97,14.9 21.1,16.36 21.1,17V18.1H8.9V17C8.9,16.36 12,14.9 15,14.9Z"></path>
        </svg>Add person
      </Button>
    </div>
    <div class="app-page-section" v-if="!isLoadingPeople && people.length === 0 && !searchTerm.trim() && !statusFilter">
      <div class="app-empty-state">
        <img class="h-24 w-auto opacity-80" src="@/assets/no-list-found.svg" alt="">
        <div>
          <p class="font-medium text-gray-800">No people yet</p>
          <p class="mt-1 text-sm text-gray-500">Add the first person in your church directory.</p>
        </div>
      </div>
    </div>
    <div class="app-page-section" v-if="!isLoadingPeople && (people.length > 0 || searchTerm.trim() || statusFilter)">
      <div class="app-panel">
        <div class="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <div class="flex grow flex-wrap gap-1.5">
            <button type="button" class="app-toolbar-btn" aria-label="Archive selected" @click="archiveSelected">
              <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"></path></svg>
            </button>
            <button type="button" class="app-toolbar-btn" aria-label="Merge is not available" @click="actionError = 'Merging two people into one record is not available yet.'">
              <svg class="h-4 w-4 rotate-90" viewBox="0 0 24 24"><path fill="currentColor" d="M17,20.41L18.41,19L15,15.59L13.59,17M7.5,8H11V13.59L5.59,19L7,20.41L13,14.41V8H16.5L12,3.5"></path></svg>
            </button>
            <button type="button" class="app-toolbar-btn" aria-label="Tag selected" @click="openTag">
              <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M16,17H5V7H16L19.55,12M17.63,5.84C17.27,5.33 16.67,5 16,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H16C16.67,19 17.27,18.66 17.63,18.15L22,12L17.63,5.84Z"></path></svg>
            </button>
            <button type="button" class="app-toolbar-btn" aria-label="Create household" @click="openHousehold">
              <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22"></path></svg>
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <label class="relative min-w-[12rem] flex-1">
              <span class="sr-only">Search people</span>
              <input
                v-model="searchTerm"
                type="search"
                placeholder="Search name or email"
                class="h-8 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-sky-400"
                @keydown.enter.prevent="loadPeople(1, perPage)"
              >
            </label>
            <select
              v-model="statusFilter"
              class="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
              aria-label="Filter by status"
              @change="loadPeople(1, perPage)"
            >
              <option value="">All statuses</option>
              <option value="visitor">Visitors</option>
              <option value="regular_attender">Regular attenders</option>
              <option value="member">Members</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
            <button type="button" class="inline-flex h-7 items-center rounded-md border border-dashed border-gray-300 px-2 text-xs font-medium text-gray-500 transition-colors hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700">
              <svg class="mr-1 h-3.5 w-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M15 17H18V14H20V17H23V19H20V22H18V19H15V17M13 19.88C13.04 20.18 12.94 20.5 12.72 20.71C12.32 21.1 11.69 21.1 11.3 20.71L7.29 16.7C7.06 16.47 6.96 16.16 7 15.87V10.75L2.21 4.62C1.87 4.19 1.95 3.56 2.38 3.22C2.57 3.08 2.78 3 3 3V3H17V3C17.22 3 17.43 3.08 17.62 3.22C18.05 3.56 18.13 4.19 17.79 4.62L13 10.75V19.88M5.04 5L9 10.07V15.58L11 17.58V10.05L14.96 5H5.04Z"></path></svg>
              Add filter
            </button>
            <button type="button" class="app-toolbar-btn" aria-label="Columns">
              <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M11,2A2,2 0 0,1 13,4V20A2,2 0 0,1 11,22H2V2H11M4,10V14H11V10H4M4,16V20H11V16H4M4,4V8H11V4H4M15,11H18V8H20V11H23V13H20V16H18V13H15V11Z"></path></svg>
            </button>
            <button type="button" class="app-toolbar-btn" aria-label="More">
              <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"></path></svg>
            </button>
          </div>
        </div>
        <p v-if="people.length === 0" class="px-4 py-8 text-center text-sm text-gray-500 sm:px-6">No people match these filters.</p>
        <div class="app-table-wrap" v-else>
          <table class="app-data-table table-fixed [&_td]:overflow-hidden [&_th]:overflow-hidden [&_td]:px-2.5 [&_th]:px-2.5 sm:[&_td]:px-2.5 sm:[&_th]:px-2.5">
            <colgroup>
              <col class="w-[5%]" />
              <col class="w-[16%]" />
              <col class="w-[12%]" />
              <col class="w-[14%]" />
              <col class="w-[18%]" />
              <col class="w-[15%]" />
              <col class="w-[14%]" />
              <col class="w-[6%]" />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <div class="flex items-center justify-center">
                    <input class="form-check-input appearance-none w-4 h-4 bg-white checked:bg-sky-600 rounded border border-gray-300 hover:border-sky-500 transition-all align-top bg-no-repeat bg-center bg-contain checked:bg-check" type="checkbox" :checked="allOnPageSelected" aria-label="Select all" @change="togglePage(($event.target as HTMLInputElement).checked)">
                  </div>
                </th>
                <th>First name</th>
                <th>Last name</th>
                <th>Status</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr class="group" v-for="person in people" :key="person.id">
                <td class="w-12">
                  <div class="flex items-center justify-center">
                    <input class="form-check-input appearance-none w-4 h-4 bg-white checked:bg-sky-600 rounded border border-gray-300 hover:border-sky-500 transition-all align-top bg-no-repeat bg-center bg-contain checked:bg-check" type="checkbox" :checked="selectedIds.includes(person.id)" :aria-label="`Select ${person.firstName}`" @change="togglePerson(person.id, ($event.target as HTMLInputElement).checked)">
                  </div>
                </td>
                <td class="overflow-hidden">
                  <UserProfilePopup
                      :person="person"
                      :includeName="true">
                    <template v-slot:default="{ getPersonImageUrl }">
                      <span class="flex items-center gap-2.5 leading-none">
                        <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-inset ring-gray-200">
                          <img class="h-full w-full object-cover" v-if="person && person.profileImage" :src="getPersonImageUrl(person)" alt="" @error="useDefaultAvatar">
                          <img class="h-full w-full object-cover" v-else src="@/assets/default-user-profile.png" alt="">
                        </span>
                        <span class="min-w-0">
                          <span class="block truncate text-sm font-medium leading-none text-gray-900">{{ person.preferredName || person.firstName }}</span>
                          <span v-if="person.preferredName && person.preferredName !== person.firstName" class="mt-0.5 block truncate text-xs leading-none text-gray-400">{{ person.firstName }}</span>
                        </span>
                      </span>
                    </template>
                  </UserProfilePopup>
                </td>
                <td class="truncate leading-none">{{ person.lastName }}</td>
                <td class="overflow-hidden leading-none">
                  <span v-if="person.lifecycleStatus" class="block max-w-full truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700" :title="person.lifecycleStatus">{{ person.lifecycleStatus }}</span>
                </td>
                <td class="truncate leading-none text-gray-600" :title="person.email || ''">{{ person.email }}</td>
                <td class="truncate leading-none text-gray-600" :title="person.mobileNumber || ''">{{ person.mobileNumber }}</td>
                <td class="truncate leading-none text-gray-500" :title="person.registeredDate ? $filters.humanDate(person.registeredDate) : ''">{{ compactDate(person.registeredDate) }}</td>
                <td class="w-12 text-right">
                  <router-link class="invisible text-xs font-medium text-sky-700 no-underline group-hover:visible" :to="{ name: 'person', params: { id: person.id } }">Edit</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Paginator :page="page" :total-pages="totalPages" :items-per-page="perPage" :load-page="loadPeople"/>
      </div>
    </div>
  </div>
  <Dialog :show="isOpenAddPersonDialog" title="Add Person" :is-form="true" :initial-focus="initialFocusRef" @close="toggleAddPersonDialog(false)" @submit="createPerson">
    <template #default>
      <div class="mb-4">
        <Label for-id="first_name">First name</Label>
        <Input class="w-full" id="first_name" type="text" v-model="newPerson.firstName" ref="initialFocusRef"></Input>
      </div>
      <div class="mb-4">
        <Label for-id="last_name">Last name</Label>
        <Input class="w-full" id="last_name" type="text" v-model="newPerson.lastName"></Input>
      </div>
      <div class="mb-4">
        <Label for-id="email">Email</Label>
        <Input class="w-full" id="email" type="email" v-model="newPerson.email"></Input>
      </div>
      <div class="mb-4">
        <Label for-id="phone_number">Phone number</Label>
        <Input class="w-full" id="phone_number" type="text" v-model="newPerson.mobileNumber"></Input>
      </div>
    </template>
    <template #controls>
      <div class="flex items-center">
        <div class="grow">
          <Button stealth @click="toggleAddPersonDialog(false)">Cancel</Button>
        </div>
        <Button type="submit" :show-loader="isCreatingPerson">Create</Button>
      </div>
    </template>
  </Dialog>
  <Dialog :show="showTag" title="Add a category" :is-form="true" @close="showTag = false" @submit="applyTag">
    <label class="block text-sm">
      <span class="app-label">Category</span>
      <select v-model="tagCategoryId" class="app-field">
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
      </select>
    </label>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="showTag = false">Cancel</Button></div>
        <Button type="submit" :show-loader="working">Add</Button>
      </div>
    </template>
  </Dialog>
  <Dialog :show="showHousehold" title="Create household" :is-form="true" @close="showHousehold = false" @submit="createHousehold">
    <div class="space-y-3">
      <label class="block text-sm"><span class="app-label">Name</span><input v-model="householdName" class="app-field" /></label>
      <label class="block text-sm">
        <span class="app-label">Leader</span>
        <select v-model="householdLeaderId" class="app-field">
          <option v-for="person in selectedPeople" :key="person.id" :value="person.id">{{ person.firstName }} {{ person.lastName }}</option>
        </select>
      </label>
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="showHousehold = false">Cancel</Button></div>
        <Button type="submit" :show-loader="working">Create</Button>
      </div>
    </template>
  </Dialog>
</template>
