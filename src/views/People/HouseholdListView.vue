<script setup lang="tsx">
import {ref, reactive, inject, computed} from 'vue'

import {onBeforeRouteUpdate, useRouter} from 'vue-router'
import { useRepo } from 'pinia-orm'

import { getHouseholdImageUrl, getPersonImageUrl } from '@/imageUtils';

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

const axios = inject('axios')

const router = useRouter()
const householdRepo = useRepo(Household)

const isOpenAddHouseholdDialog = ref(false)
const isCreatingHousehold = ref(false)
const isLoadingHousehold = ref(false)
const showHouseholdLoadingError = ref(false)
const initialFocusRef = ref(null)
const createHouseholdSuccess = ref(false)
const createHouseholdFailed = ref(false)
let clickCount = 0; // Click count tracker

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
  leader_id: null,
  people_ids: [],
  address_id: null,
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
  if (!newHousehold.address) {
    newHousehold.address = {}; // Initialize the address object if it's not defined
  }
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

const loadHouseholds = () => {
  isLoadingHousehold.value = true
  axios
    .get('/households')
    .then(response => {
      useRepo(Household).save(response.data.items)
      isLoadingHousehold.value = false
    })
    .catch((err) => {
      showHouseholdLoadingError.value = true
    })
}

loadHouseholds();

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
  households.value.push(household);

}

const createHousehold = () => {
  if (!isCreatingHousehold.value) {
    isCreatingHousehold.value = true

    //first create address and save created ID.
    axios
      .post('/addresses', newHousehold.address)
      .then(response => {
        newHousehold.address_id = response.data.id;
        delete newHousehold.address;
        //then create household
        axios
            .post('/households', newHousehold)
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
        //remove address object from newHousehold
        delete newHousehold.address;
        axios
            .post('/households', newHousehold)
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
        households.value = useRepo(Household).all();

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
  <Toaster message="New household added" type="success" :show="createHouseholdSuccess" @close="createHouseholdSuccess = false" timeout="3000"></Toaster>
  <Toaster message="Failed New household added" type="error" :show="createHouseholdFailed" @close="createHouseholdFailed = false" ></Toaster>

  <div class="ml-menu py-main-tb" id="people-list">
    <div class="flex items-center px-main-lr mb-10">
      <h1 class="grow">All Households</h1>
      <Button @click="toggleAddHouseholdDialog(true)">
        <svg class="mr-2" style="width:16px;height:16px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4M15,5.9C16.16,5.9 17.1,6.84 17.1,8C17.1,9.16 16.16,10.1 15,10.1A2.1,2.1 0 0,1 12.9,8A2.1,2.1 0 0,1 15,5.9M4,7V10H1V12H4V15H6V12H9V10H6V7H4M15,13C12.33,13 7,14.33 7,17V20H23V17C23,14.33 17.67,13 15,13M15,14.9C17.97,14.9 21.1,16.36 21.1,17V18.1H8.9V17C8.9,16.36 12,14.9 15,14.9Z"></path>
        </svg>Add Household
      </Button>
    </div>
    <div class="px-main-lr" v-if="!isLoadingHousehold && households.length === 0">
      <div class="bg-white w-full flex items-center py-8">
        <div class="grow flex justify-center"><img src="@/assets/no-list-found.svg"></div>
        <div class="grow">No households added yet</div>
      </div>
    </div>
    <div class="bg-white w-full" v-if="!isLoadingHousehold && households.length > 0">
      <div class="flex py-2 px-main-lr items-center border-b border-gray-100">
        <div class="grow">
          <button class="w-8 h-8 mr-2 inline-flex justify-center items-center rounded-md border border-gray-300 text-gray-400">
            <svg style="width:16px;height:16px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"></path>
            </svg>
          </button>
          <button class="w-8 h-8 mr-2 inline-flex justify-center items-center rounded-md border border-gray-300 text-gray-400">
            <svg class="rotate-90" style="width:16px;height:16px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M17,20.41L18.41,19L15,15.59L13.59,17M7.5,8H11V13.59L5.59,19L7,20.41L13,14.41V8H16.5L12,3.5"></path>
            </svg>
          </button>
          <button class="w-8 h-8 mr-2 inline-flex justify-center items-center rounded-md border border-gray-300 text-gray-400">
            <svg style="width:16px;height:16px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16,17H5V7H16L19.55,12M17.63,5.84C17.27,5.33 16.67,5 16,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H16C16.67,19 17.27,18.66 17.63,18.15L22,12L17.63,5.84Z"></path>
            </svg>
          </button>
          <button class="w-8 h-8 mr-2 inline-flex justify-center items-center rounded-md border border-gray-300 text-gray-400">
            <svg style="width:16px;height:16px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22"></path>
            </svg>
          </button>
        </div>
        <div class="flex items-center"><span class="h-7 mr-2 px-3 bg-sky-100 text-sky-400 text-sm inline-flex items-center rounded-md">Status: Member
            <svg class="ml-1" style="width:12px;height:12px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
            </svg></span>
          <button class="h-7 mr-2 px-2 text-sm inline-flex items-center rounded-md border border-dashed border-sky-400 hover_border-sky-300 text-sky-400 bg-transparent hover_bg-sky-50 transition-all">
            <svg class="mr-1" style="width:16px;height:16px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M15 17H18V14H20V17H23V19H20V22H18V19H15V17M13 19.88C13.04 20.18 12.94 20.5 12.72 20.71C12.32 21.1 11.69 21.1 11.3 20.71L7.29 16.7C7.06 16.47 6.96 16.16 7 15.87V10.75L2.21 4.62C1.87 4.19 1.95 3.56 2.38 3.22C2.57 3.08 2.78 3 3 3V3H17V3C17.22 3 17.43 3.08 17.62 3.22C18.05 3.56 18.13 4.19 17.79 4.62L13 10.75V19.88M5.04 5L9 10.07V15.58L11 17.58V10.05L14.96 5H5.04Z"></path>
            </svg>Add filter
          </button>
          <button class="w-8 h-7 mr-2 inline-flex justify-center items-center rounded-md border border-sky-400 hover_border-sky-300 text-sky-400 bg-transparent hover_bg-sky-50 transition-all">
            <svg style="width:16px;height:16px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M11,2A2,2 0 0,1 13,4V20A2,2 0 0,1 11,22H2V2H11M4,10V14H11V10H4M4,16V20H11V16H4M4,4V8H11V4H4M15,11H18V8H20V11H23V13H20V16H18V13H15V11Z"></path>
            </svg>
          </button>
          <button class="w-8 h-7 inline-flex justify-center items-center rounded-md border border-sky-400 hover_border-sky-300 text-sky-400 bg-transparent hover_bg-sky-50 transition-all">
            <svg style="width:16px;height:16px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"></path>
            </svg>
          </button>
        </div>
      </div>
      <table class="table-auto w-full text-left text-sm">
        <thead class="text-gray-500 border-b border-gray-100">
          <tr>
            <th class="py-3 w-main-lr">
              <div class="flex items-center justify-around">
                <input class="form-check-input appearance-none w-4 h-4 bg-gray-100 checked_bg-sky-500 rounded border border-gray-300 hover_border-sky-500 transition-all align-top bg-no-repeat bg-center bg-contain checked_bg-check" type="checkbox" value="">
              </div>
            </th>
            <th class="py-3">Last name</th>
            <th class="py-3">Suburb, City</th>
            <th class="py-3">Members</th>
          </tr>
        </thead>
        <tbody>
          <tr class="group hover_bg-sky-100" v-for="household in households">
            <td class="py-3 w-main-lr">
              <div class="flex items-center justify-around">
                <input class="form-check-input appearance-none w-4 h-4 bg-gray-100 checked_bg-sky-500 rounded border border-gray-300 hover_border-sky-500 transition-all align-top bg-no-repeat bg-center bg-contain checked_bg-check" type="checkbox" value="">
              </div>
            </td>
            <td class="py-3 flex items-center"><img class="w-10 h-10 mr-2 rounded-full" v-if="household && household.householdImage" :src="getHouseholdImageUrl(household)"><img class="w-8 h-8 mr-2 rounded-full" v-else src="@/assets/default-user-profile.png">
              <router-link class="no-underline group-hover_underline text-current group-hover_text-sky-500" :to="{ name: 'household', params: { id: household.id } }">{{ household.leader.lastName}} </router-link>
            </td>
            <td class="py-3">
              <div v-if="household && household.address">
                <AddressDisplay :address="household.address" addressFormat="[[suburb]], [[city]]" />
              </div>
              <div v-else>
                N/A
              </div>
            </td>
            <td>
              <!-- show a list of circular images of the members -->
                <div v-for="member in household.people"  class="inline" @click="redirectToPersonPage(member)">
                  <UserProfilePopup
                      :person="member"
                      :includeName="false">
                    <template v-slot:default="{ getPersonImageUrl }">
                      <img class="w-10 h-10 mr-1 rounded-full inline cursor-pointer" v-if="member && member.profileImage" :src="getPersonImageUrl(member)" :title="member.firstName">
                      <img class="w-10 h-10 rounded-full inline cursor-pointer" v-else src="@/assets/default-user-profile.png" :title="member.firstName">
                    </template>
                  </UserProfilePopup>
                </div>
            </td>
            <td class="py-3 w-main-lr"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-if="isOpenAddHouseholdDialog">
    <Dialog :show="true" title="Add Household" :is-form="true" :initial-focus="initialFocusRef" @close="toggleAddHouseholdDialog(false)" @submit="createHousehold">
      <template #default>

      <div class="dialog-content">
        <div class="mb-4">
          <Label for-id="Leader">Household Leader</Label>
          <UserSelect @person-selected="handlePersonSelected" v-model="newHousehold.leader"></UserSelect>
        </div>

        <!-- Other form fields can go here, each in its separate <div class="mb-4"> for spacing -->
        <!-- Address Entry Form -->

        <div class="mb-4">
          <div class="flex">
            <div class="w-1/3 pr-2">
              <Label for-id="streetNumber">Street Number</Label>
              <Input v-model="newHousehold.address.street_number" @click="handleClick" />
            </div>
            <div class="w-2/3">
              <Label for-id="Street">Street</Label>
              <Input v-model="newHousehold.address.street" />
            </div>
          </div>
        </div>
        <div class="mb-4">
          <div class="flex">
            <div class="w-1/2 pr-2">
              <Label for-id="Suburb">Suburb</Label>
              <Input v-model="newHousehold.address.suburb" />
            </div>
            <div class="w-1/2">
              <Label for-id="City">City</Label>
              <Input v-model="newHousehold.address.city" />
            </div>
          </div>
        </div>
        <div class="mb-4">
          <div class="flex">
            <div class="w-2/5 pr-2">
              <Label for-id="Province">Province</Label>
              <Input v-model="newHousehold.address.province" />
            </div>
            <div class="w-2/5">
              <Label for-id="Country">Country</Label>
              <Input v-model="newHousehold.address.country" />
            </div>
            <div class="w-1/5 pl-2">
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
  max-height: 800px; /* Set the maximum height you desire */
  max-width: 400px;
  overflow-y: visible; /* Set the overflow behavior */
}
</style>
