<script setup lang="ts">
import type { AxiosInstance } from 'axios'
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

const newPerson = reactive({
  firstName: '',
  lastName: '',
  email: '',
  mobileNumber: ''
})

const people = computed(() => {
  return useRepo(Person).all()
})

const loadPeople = (currentPage, itemsPerPage) => {
  isLoadingPeople.value = true
  axios
    .get('/people',{
      params: {
        page: currentPage,
        page_size: itemsPerPage,
      },
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
  <div class="app-page" id="people-list">
    <div class="app-page-header">
      <h1 class="grow min-w-0">All People</h1>
      <Button @click="toggleAddPersonDialog(true)">
        <svg class="mr-2" style="width:16px;height:16px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4M15,5.9C16.16,5.9 17.1,6.84 17.1,8C17.1,9.16 16.16,10.1 15,10.1A2.1,2.1 0 0,1 12.9,8A2.1,2.1 0 0,1 15,5.9M4,7V10H1V12H4V15H6V12H9V10H6V7H4M15,13C12.33,13 7,14.33 7,17V20H23V17C23,14.33 17.67,13 15,13M15,14.9C17.97,14.9 21.1,16.36 21.1,17V18.1H8.9V17C8.9,16.36 12,14.9 15,14.9Z"></path>
        </svg>Add person
      </Button>
    </div>
    <div class="app-page-section" v-if="!isLoadingPeople && people.length === 0">
      <div class="app-empty-state">
        <img class="h-24 w-auto opacity-80" src="@/assets/no-list-found.svg" alt="">
        <div>
          <p class="font-medium text-gray-800">No people yet</p>
          <p class="mt-1 text-sm text-gray-500">Add the first person in your church directory.</p>
        </div>
      </div>
    </div>
    <div class="app-page-section" v-if="!isLoadingPeople && people.length > 0">
      <div class="app-panel">
        <div class="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <div class="flex grow flex-wrap gap-1.5">
            <button type="button" class="app-toolbar-btn" aria-label="Delete">
              <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"></path></svg>
            </button>
            <button type="button" class="app-toolbar-btn" aria-label="Merge">
              <svg class="h-4 w-4 rotate-90" viewBox="0 0 24 24"><path fill="currentColor" d="M17,20.41L18.41,19L15,15.59L13.59,17M7.5,8H11V13.59L5.59,19L7,20.41L13,14.41V8H16.5L12,3.5"></path></svg>
            </button>
            <button type="button" class="app-toolbar-btn" aria-label="Tag">
              <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M16,17H5V7H16L19.55,12M17.63,5.84C17.27,5.33 16.67,5 16,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H16C16.67,19 17.27,18.66 17.63,18.15L22,12L17.63,5.84Z"></path></svg>
            </button>
            <button type="button" class="app-toolbar-btn" aria-label="Household">
              <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22"></path></svg>
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="app-filter-chip">Status: Member
              <svg class="h-3 w-3" viewBox="0 0 24 24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg>
            </span>
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
        <div class="app-table-wrap">
          <table class="app-data-table min-w-[44rem]">
            <thead>
              <tr>
                <th class="w-12">
                  <div class="flex items-center justify-center">
                    <input class="form-check-input appearance-none w-4 h-4 bg-white checked:bg-sky-600 rounded border border-gray-300 hover:border-sky-500 transition-all align-top bg-no-repeat bg-center bg-contain checked:bg-check" type="checkbox" value="" aria-label="Select all">
                  </div>
                </th>
                <th>First name</th>
                <th>Last name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
                <th class="w-12"></th>
              </tr>
            </thead>
            <tbody>
              <tr class="group" v-for="person in people" :key="person.id">
                <td class="w-12">
                  <div class="flex items-center justify-center">
                    <input class="form-check-input appearance-none w-4 h-4 bg-white checked:bg-sky-600 rounded border border-gray-300 hover:border-sky-500 transition-all align-top bg-no-repeat bg-center bg-contain checked:bg-check" type="checkbox" value="" :aria-label="`Select ${person.firstName}`">
                  </div>
                </td>
                <td>
                  <UserProfilePopup
                      :person="person"
                      :includeName="true">
                    <template v-slot:default="{ getPersonImageUrl }">
                      <span class="flex items-center gap-2.5 leading-none">
                        <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-inset ring-gray-200">
                          <img class="h-full w-full object-cover" v-if="person && person.profileImage" :src="getPersonImageUrl(person)" alt="">
                          <img class="h-full w-full object-cover" v-else src="@/assets/default-user-profile.png" alt="">
                        </span>
                        <span class="truncate text-sm font-medium leading-none text-gray-900">{{ person.firstName }}</span>
                      </span>
                    </template>
                  </UserProfilePopup>
                </td>
                <td class="leading-none">{{ person.lastName }}</td>
                <td class="leading-none text-gray-600">{{ person.email }}</td>
                <td class="leading-none text-gray-600">{{ person.mobileNumber }}</td>
                <td class="whitespace-nowrap leading-none text-gray-500">{{ $filters.shortDateTime(person.registeredDate) }}</td>
                <td class="w-12 text-right">
                  <button type="button" class="invisible inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 group-hover:visible" aria-label="Row actions">
                    <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"></path></svg>
                  </button>
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
</template>

<style>
/* Basic styling for the profile popup */
.profile-popup {
  position: absolute;
  align-items: center; /* Center horizontally */
  justify-content: center; /* Center vertically */
  text-align: center; /* Center text horizontally */
  top: calc(100% + 10px); /* Position below the link */
  left: 0;
  z-index: 1;
  background-color: whitesmoke;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 16px;
  border-radius: 10px;
  font-family: Arial, sans-serif; /* Set the desired font family */
  font-size: 14px;
  color: #333;
  max-width: 200px; /* Adjust as needed */
}

/* Styling for the profile image */
.profile-image {
  margin: 0 auto; /* Center horizontally */
  width: 150px;
  height: 150px;
  border-radius: 50%; /* Rounded image */
  margin-bottom: 10px;
  object-fit: cover; /* Ensure the image covers the container */

}

/* Styling for the profile name */
.profile-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 6px;
}

/* Styling for the profile details */
.profile-details {
  margin-bottom: 10px;
}

/* Styling for the age and date of birth */
.profile-details span {
  margin-right: 10px;
}

/* Styling for the link */
.profile-link {
  color: #007bff; /* Link color */
  text-decoration: none;
}

/* Hover effect for the link */
.profile-link:hover + .profile-popup {
  display: block;
}
</style>
