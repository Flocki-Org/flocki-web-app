<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import {ref, reactive, inject, computed} from 'vue'

import {onBeforeRouteUpdate, useRouter} from 'vue-router'
import { useRepo } from 'pinia-orm'

import { getHouseholdImageUrl } from '@/imageUtils';

import Button from '@/components/Forms/Button.vue'
import Label from '@/components/Forms/Label.vue'
import Input from '@/components/Forms/Input.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import Toaster from '@/components/Widgets/Toaster.vue'
import Household from "@/models/Household";
import AddressDisplay from '../../components/AddressDisplay.vue';
import UserProfilePopup from '../../components/people/UserProfilePopup.vue';
import Person from "@/models/Person";
import UserSelect from "@/components/people/UserSelect.vue";
import Paginator from "@/components/Paginator.vue";

const axios = inject<AxiosInstance>('axios')

const router = useRouter()

const isOpenAddHouseholdDialog = ref(false)
const isCreatingHousehold = ref(false)
const isLoadingHousehold = ref(false)
const showHouseholdLoadingError = ref(false)
const initialFocusRef = ref(null)
const createHouseholdSuccess = ref(false)
const createHouseholdFailed = ref(false)
let clickCount = 0; // Click count tracker

const page = ref(1)
const perPage = ref(10)
const total = ref(0)
const totalPages = ref(0)

// Function to handle the triple click event
const handleClick = () => {
  clickCount++;
  console.log(clickCount);

  if (clickCount >= 3) {
    // Generate and fill in random address values
    fillInRandomAddress();
    clickCount = 0; // Reset the click count
  }
};


const newHousehold = reactive({
  leader_id: null as number | null,
  leader: null as Person | null,
  people_ids: [] as Array<number | null>,
  address_id: null as number | null,
  address: {
    street_number: '',
    street: '',
    suburb: '',
    city: '',
    province: '',
    country: '',
    postal_code: '',
    type: 'home'
  }
})

// Function to generate and fill in random address values
const fillInRandomAddress = () => {
  // Generate random address values (you can customize this part)
  newHousehold.address.street_number = String(Math.floor(Math.random() * 100) + 1); // Example: Random street number from 1 to 100
  newHousehold.address.street = 'Random Street Name';
  newHousehold.address.suburb = 'Random Suburb';
  newHousehold.address.city = 'Random City';
  newHousehold.address.province = 'Random Province';
  newHousehold.address.country = 'South Africa';
  newHousehold.address.postal_code = '1685';
};

const households = computed(() => {
  return useRepo(Household).all()
})

const toggleAddHouseholdDialog = (val: boolean) => {
  console.log('toggleAddHouseholdDialog: ', val);
  isOpenAddHouseholdDialog.value = val
}

const loadHouseholds = (currentPage, itemsPerPage) => {
  isLoadingHousehold.value = true
  axios
    .get('/households',{
            params: {
            page: currentPage,
            page_size: itemsPerPage,
          },
        }
    )
    .then(response => {
      const householdRepo = useRepo(Household);
      householdRepo.flush();
      householdRepo.save(response.data.items)
      page.value = response.data.page;
      total.value = response.data.total;
      totalPages.value = Math.ceil( total.value/ response.data.size);
      console.log('totalPages: ', totalPages.value, 'total: ', total.value, 'page: ', page.value, 'perPage: ', perPage.value);
      isLoadingHousehold.value = false
    })
    .catch((err) => {
      showHouseholdLoadingError.value = true
    })
}

loadHouseholds(1, perPage.value);

onBeforeRouteUpdate((to, from) => {
})

const handlePersonSelected = (person: Person) => {
  console.log('Selected person:', person);
  newHousehold.leader_id = person.id;
  newHousehold.people_ids.push(person.id);
}

const handleSuccessfulHouseholdCreation = (household: Household) => {
  isOpenAddHouseholdDialog.value = false;
  isCreatingHousehold.value = false;
  createHouseholdSuccess.value = true;
  useRepo(Household).save(household);
}

const createHousehold = () => {
  if (!isCreatingHousehold.value) {
    isCreatingHousehold.value = true

    //first create address and save created ID.
    axios
      .post('/addresses', newHousehold.address)
      .then(response => {
        newHousehold.address_id = response.data.id;
        const { address: _address, leader: _leader, ...householdPayload } = newHousehold
        //then create household
        axios
            .post('/households', householdPayload)
            .then(response => {
              handleSuccessfulHouseholdCreation(response.data);
            }) .catch(error => {
              console.log('got here in error of creating household for new address');
              console.log(error);
              isCreatingHousehold.value = false;
              isOpenAddHouseholdDialog.value = false;
              createHouseholdFailed.value = true;
        });
      }) .catch(error => {
      if (error.response && error.response.status === 409) {
        // Handle the 409 Conflict response here, if needed.
        newHousehold.address_id = error.response.data.id;
        const { address: _address, leader: _leader, ...householdPayload } = newHousehold
        axios
            .post('/households', householdPayload)
            .then(response => {
              handleSuccessfulHouseholdCreation(response.data);
            }) .catch(error => {
              console.log('got here in error of creating household');
              console.log(error);
              isCreatingHousehold.value = false;
              isOpenAddHouseholdDialog.value = false;
              createHouseholdFailed.value = true;
            });
      } else {
        // Handle other errors that occur during the request.
        console.error('An error occurred:', error);
        isOpenAddHouseholdDialog.value = false;
        isCreatingHousehold.value = false;
        createHouseholdFailed.value = true;
      }
    });


  }
}

const redirectToPersonPage = (member) =>  {
  // Assuming 'member.id' is the unique identifier for each person
  router.push({ name: 'person', params: { id: member.id } });
}

</script>

<template>
  <Toaster message="Couldn't retrieve people. Please try again later." type="error" :show="showHouseholdLoadingError" @close="showHouseholdLoadingError = false"></Toaster>
  <Toaster message="New household added" type="success" :show="createHouseholdSuccess" @close="createHouseholdSuccess = false" :timeout="3000"></Toaster>
  <Toaster message="Failed New household added" type="error" :show="createHouseholdFailed" @close="createHouseholdFailed = false" ></Toaster>

  <div class="app-page" id="people-list">
    <div class="app-page-header">
      <h1 class="grow min-w-0">All Households</h1>
      <Button @click="toggleAddHouseholdDialog(true)">
        <svg class="mr-2" style="width:16px;height:16px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4M15,5.9C16.16,5.9 17.1,6.84 17.1,8C17.1,9.16 16.16,10.1 15,10.1A2.1,2.1 0 0,1 12.9,8A2.1,2.1 0 0,1 15,5.9M4,7V10H1V12H4V15H6V12H9V10H6V7H4M15,13C12.33,13 7,14.33 7,17V20H23V17C23,14.33 17.67,13 15,13M15,14.9C17.97,14.9 21.1,16.36 21.1,17V18.1H8.9V17C8.9,16.36 12,14.9 15,14.9Z"></path>
        </svg>Add Household
      </Button>
    </div>
    <div class="app-page-section" v-if="!isLoadingHousehold && households.length === 0">
      <div class="app-empty-state">
        <img class="h-24 w-auto opacity-80" src="@/assets/no-list-found.svg" alt="">
        <div>
          <p class="font-medium text-gray-800">No households yet</p>
          <p class="mt-1 text-sm text-gray-500">Create a household to group family members together.</p>
        </div>
      </div>
    </div>
    <div class="app-page-section" v-if="!isLoadingHousehold && households.length > 0">
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
          <table class="app-data-table min-w-[36rem]">
            <thead>
              <tr>
                <th class="w-12">
                  <div class="flex items-center justify-center">
                    <input class="form-check-input appearance-none w-4 h-4 bg-white checked:bg-sky-600 rounded border border-gray-300 hover:border-sky-500 transition-all align-top bg-no-repeat bg-center bg-contain checked:bg-check" type="checkbox" value="" aria-label="Select all">
                  </div>
                </th>
                <th>Last name</th>
                <th>Suburb, City</th>
                <th>Members</th>
              </tr>
            </thead>
            <tbody>
              <tr class="group" v-for="household in households" :key="household.id">
                <td class="w-12">
                  <div class="flex items-center justify-center">
                    <input class="form-check-input appearance-none w-4 h-4 bg-white checked:bg-sky-600 rounded border border-gray-300 hover:border-sky-500 transition-all align-top bg-no-repeat bg-center bg-contain checked:bg-check" type="checkbox" value="" aria-label="Select household">
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2.5 leading-none">
                    <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-inset ring-gray-200">
                      <img class="h-full w-full object-cover" v-if="household && household.householdImage" :src="getHouseholdImageUrl(household)" alt="">
                      <img class="h-full w-full object-cover" v-else src="@/assets/default-user-profile.png" alt="">
                    </span>
                    <router-link class="truncate text-sm font-medium leading-none text-gray-900 no-underline hover:text-sky-700" :to="{ name: 'household', params: { id: household.id } }">{{ household.leader.lastName }}</router-link>
                  </div>
                </td>
                <td class="text-gray-600">
                  <div v-if="household && household.address">
                    <AddressDisplay :address="household.address" addressFormat="[[suburb]], [[city]]" />
                  </div>
                  <div v-else class="text-gray-400">N/A</div>
                </td>
                <td>
                  <div class="flex flex-wrap items-center gap-1">
                    <div v-for="member in household.people" :key="member.id" class="inline-flex" @click="redirectToPersonPage(member)">
                      <UserProfilePopup :person="member">
                        <template v-slot:default="{ getPersonImageUrl }">
                          <span class="inline-flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-white">
                            <img class="h-full w-full object-cover" v-if="member && member.profileImage" :src="getPersonImageUrl(member)" :title="member.firstName" alt="">
                            <img class="h-full w-full object-cover" v-else src="@/assets/default-user-profile.png" :title="member.firstName" alt="">
                          </span>
                        </template>
                      </UserProfilePopup>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Paginator :page="page" :total-pages="totalPages" :items-per-page="perPage" :load-page="loadHouseholds"/>
      </div>
    </div>
  </div>
  <div v-if="isOpenAddHouseholdDialog">
    <Dialog :show="true" title="Add Household" :is-form="true" :initial-focus="initialFocusRef" @close="toggleAddHouseholdDialog(false)" @submit="createHousehold">
      <template #default>

      <div class="dialog-content w-full">
        <div class="mb-4">
          <Label for-id="Leader">Household Leader</Label>
          <UserSelect @person-selected="handlePersonSelected" v-model="newHousehold.leader" peopleUrl="/people/with_name_or_surname"></UserSelect>
        </div>

        <!-- Other form fields can go here, each in its separate <div class="mb-4"> for spacing -->
        <!-- Address Entry Form -->

        <div class="mb-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:gap-0">
            <div class="w-full sm:w-1/3 sm:pr-2">
              <Label for-id="streetNumber">Street Number</Label>
              <Input v-model="newHousehold.address.street_number" @click="handleClick" />
            </div>
            <div class="w-full sm:w-2/3">
              <Label for-id="Street">Street</Label>
              <Input v-model="newHousehold.address.street" />
            </div>
          </div>
        </div>
        <div class="mb-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:gap-0">
            <div class="w-full sm:w-1/2 sm:pr-2">
              <Label for-id="Suburb">Suburb</Label>
              <Input v-model="newHousehold.address.suburb" />
            </div>
            <div class="w-full sm:w-1/2">
              <Label for-id="City">City</Label>
              <Input v-model="newHousehold.address.city" />
            </div>
          </div>
        </div>
        <div class="mb-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:gap-0">
            <div class="w-full sm:w-2/5 sm:pr-2">
              <Label for-id="Province">Province</Label>
              <Input v-model="newHousehold.address.province" />
            </div>
            <div class="w-full sm:w-2/5">
              <Label for-id="Country">Country</Label>
              <Input v-model="newHousehold.address.country" />
            </div>
            <div class="w-full sm:w-1/5 sm:pl-2">
              <Label for-id="PostalCode">Code</Label>
              <Input v-model="newHousehold.address.postal_code" />
            </div>
          </div>
        </div>
      </div>
      </template>
        <!-- End of Address Entry Form -->
        <template #controls>
        <div class="flex justify-end mt-4">
          <div>
            <Button stealth @click="toggleAddHouseholdDialog(false)">Cancel</Button>
          </div>
          <div>
            <Button type="submit" class="ml-2" :show-loader="isCreatingHousehold">Create</Button>
          </div>
        </div>
      </template>

    </Dialog>
  </div>
</template>

<style scoped>

.dialog-content {
  max-height: min(70vh, 800px);
  max-width: 100%;
  overflow-y: auto;
}
</style>
