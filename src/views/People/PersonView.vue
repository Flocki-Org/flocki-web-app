<script setup lang="ts">

import { ref, inject, onMounted} from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useRepo } from 'pinia-orm'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Toaster from '@/components/Widgets/Toaster.vue'
import Person from '@/models/Person'
import ImageCropperUploader from '../../components/ImageCropperUploader.vue';

import { getPersonImageUrl, getHouseholdImageUrl } from '@/imageUtils';
import Household from "@/models/Household";


const axios = inject('axios')

const route = useRoute()
const personRepo = useRepo(Person)

const isLoadingPerson = ref(true)
const showLoadingError = ref(false)
const person = ref(null)

const hovered = ref(false);
const dropdownVisible = ref(false);
const profileImageViewVisible = ref(false)
const uploadProfileImage = ref(false)
const croppedImage = ref(null);
const uploadProfileImageFailed = ref(false);
const uploadProfileImageSuccess = ref(false);

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

const handleCroppedImage = (dataUrl) => {
  croppedImage.value = dataUrl;
};

const loadPerson = (id) => {

  axios
      .get('/people/' + id)
      .then(response => {

        useRepo(Person).save(response.data)
        person.value = useRepo(Person).find(+id)
        // TODO: remove timeout later
        setTimeout(() => {
          isLoadingPerson.value = false
        }, 2000)
      })
      .catch((err) => {
        console.log(err)

        showLoadingError.value = true
      })
}

loadPerson(route.params.id)

onMounted(() => {
  // Check if the map element already has a map associated with it
  if (document.getElementById('map') && !document.getElementById('map')._leaflet_id) {
    let map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);
  }
});

onBeforeRouteUpdate((to, from) => {
  loadPerson(to.params.id)
})

const viewProfileImage = () => {
  profileImageViewVisible.value=true;
  // Prevent scrolling
  document.body.style.overflow = 'hidden';
};

const closeProfileImageView = () => {
  profileImageViewVisible.value = false;

  // Allow scrolling again
  document.body.style.overflow = 'auto';
}

const viewUploadProfileImage = () => {
  uploadProfileImage.value=true;
  // Prevent scrolling
  document.body.style.overflow = 'hidden';
};

const closeUploadProfileImageView = () => {
  uploadProfileImage.value = false;

  // Allow scrolling again
  document.body.style.overflow = 'auto';
}

const handleImageUploadedSuccess = () => {
  uploadProfileImage.value = false;
  uploadProfileImageSuccess.value = true;
  setTimeout(() => {
    uploadProfileImageSuccess.value = false;
  }, 3000);

  if(person && person.value)
    loadPerson(person.value.id)

}

const handleImageUploadFailed = () => {
  uploadProfileImage.value = false;
  setTimeout(() => {
    uploadProfileImageFailed.value = false;
  }, 8000);
  uploadProfileImageFailed.value = true;
}
</script>

<template>
  <Toaster message="Couldn't retrieve the user. Please try again later." type="error" :show="showLoadingError" @close="showLoadingError = false"></Toaster>
  <Toaster message="Uploading of image failed" type="error" :show="uploadProfileImageFailed" @close="uploadProfileImageFailed = false"></Toaster>
  <Toaster message="New Profile Image Uploaded" type="success" :show="uploadProfileImageSuccess" @close="uploadProfileImageSuccess = false" ></Toaster>

  <div class="ml-menu py-main-tb" id="person">
    <div class="flex items-center px-main-lr mb-10 relative">
      <router-link class="absolute -ml-8 no-underline text-gray-600 font-bold text-lg hover_pr-2 hover_-ml-9 transition-all" :to="{ name: 'people' }">
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z"></path>
        </svg>
      </router-link>
      <h1 class="grow text-gray-600">
        <Skeletor v-if="isLoadingPerson" width="350"></Skeletor>
        <template v-else>{{ person.fullName }}</template>
      </h1>
      <button class="w-10 h-8 inline-flex justify-center items-center rounded-md border border-sky-400 hover_border-sky-300 text-sky-400 bg-transparent hover_bg-sky-50 transition-all">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"></path>
        </svg>
      </button>
    </div>
    <div class="flex px-main-lr gap-5">
      <div class="flex flex-col gap-5 w-3/5">
        <div class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover_shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center px-10 py-8">
            <h2 class="grow text-gray-700">Basic Information</h2>
            <button class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover_border-gray-200 text-gray-400 bg-transparent hover_bg-gray-50 transition-all">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <table class="table-auto w-full text-left text-sm">
            <tbody>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Date of birth</td>
                <td class="py-4">
                  <Skeletor v-if="isLoadingPerson" width="200"></Skeletor>
                  <template v-else-if="!!person.dateOfBirth">{{ $filters.humanDate(person.dateOfBirth) }} ({{ $filters.durationInYearsOrMonths(person.dateOfBirth) }} old)</template>
                </td>
              </tr>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Gender</td>
                <td class="py-4">
                  <Skeletor v-if="isLoadingPerson" width="80"></Skeletor>
                  <template v-else>{{ person?.gender }}</template>
                </td>
              </tr>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Marital status</td>
                <td class="py-4">
                  <Skeletor v-if="isLoadingPerson" width="200"></Skeletor>
                  <template v-else>{{ person?.maritalStatus }}
                    <template v-if="!!person.marriageDate">

                      ({{ $filters.humanDate(person.marriageDate) }} - {{ $filters.durationInYearsOrMonths(person.marriageDate) }})
                    </template>
                  </template>
                </td>
              </tr>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Email address</td>
                <td class="py-4">
                  <Skeletor v-if="isLoadingPerson" width="160"></Skeletor>
                  <template v-else>{{ person?.email }}</template>
                </td>
              </tr>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Phone number</td>
                <td class="py-4">
                  <Skeletor v-if="isLoadingPerson" width="120"></Skeletor>
                  <template v-else>{{ person?.mobileNumber }}</template>
                </td>
              </tr>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Social profiles</td>
                <td class="py-4 flex">
                  <Skeletor v-if="isLoadingPerson" width="100"></Skeletor>
                  <template v-else><a class="mr-1 hover_opacity-80 transition-all text-[#0077B5]" href="#">
                      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z"></path>
                      </svg></a><a class="mr-1 hover_opacity-80 transition-all text-[#4267B2]" href="#">
                      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"></path>
                      </svg></a><a class="mr-1 hover_opacity-80 transition-all text-[#1DA1F2]" href="#">
                      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"></path>
                      </svg></a></template>
                </td>
              </tr>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500">Registered at</td>
                <td class="py-4">
                  <Skeletor v-if="isLoadingPerson" width="230"></Skeletor>
                  <template v-else-if="!!person.registeredDate">{{ $filters.fullDateTime(person.registeredDate) }} ({{ $filters.humanize(person.registeredDate) }} ago)</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover_shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center px-10 py-8">
            <h2 class="grow text-gray-700">Church Life</h2>
            <button class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover_border-gray-200 text-gray-400 bg-transparent hover_bg-gray-50 transition-all">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <table class="table-auto w-full text-left text-sm">
            <tbody>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Role</td>
                <td class="py-4">Member, Deacon</td>
              </tr>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Date baptized</td>
                <td class="py-4">25 February 1992</td>
              </tr>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Member from</td>
                <td class="py-4">30 June 1991</td>
              </tr>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Leading ministries</td>
                <td class="py-4">
                  <ul>
                    <li>
                      <router-link to="#">Hospitality Ministry</router-link>
                    </li>
                    <li>
                      <router-link to="#">Web & IT Ministry</router-link>
                    </li>
                  </ul>
                </td>
              </tr>
              <tr class="odd_bg-gray-50 even_bg-white">
                <td class="py-4 pl-10 text-gray-500 w-2/5">Groups</td>
                <td class="py-4">
                  <ul>
                    <li>
                      <router-link to="#">The Book Club</router-link>
                    </li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover_shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center px-10 py-8">
            <h2 class="grow text-gray-700">Address</h2>
            <button class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover_border-gray-200 text-gray-400 bg-transparent hover_bg-gray-50 transition-all">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <div class="address px-10 mb-4 text-gray-500 text-sm">27 Tate cres., Lonehill, Johannesburg, 2062</div>
          <div class="w-full h-60" id="map"></div>
        </div>
        <div class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover_shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center px-10 py-8">
            <h2 class="grow text-gray-700">Prayer Requests</h2>
            <button class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover_border-gray-200 text-gray-400 bg-transparent hover_bg-gray-50 transition-all">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <div class="text-sm font-bold text-gray-500 px-10">27 February 2022</div>
          <div class="text-sm text-gray-500 px-10 mb-6">Please pray for my grandmother that she may be saved, pray for my family for strength and comfort in this difficult time.</div>
        </div>
      </div>
      <div class="flex flex-col gap-5 w-2/5">
        <div class="flex items-center justify-center">
          <div @click="toggleDropdown" class="relative"
               @mouseenter="hovered = true"
               @mouseleave="hovered=false, dropdownVisible = false ">

            <img class="rounded-lg reduce-height-in-panel  cursor-pointer transition-transform duration-300 transform hover:scale-110 hover-brightness"
                 v-if="person.profileImage"
                 :src="getPersonImageUrl(person)">
            <img class="rounded-lg w-full cursor-pointer transition-transform duration-300 transform hover:scale-110 hover-brightness"
                 v-else
                 src="@/assets/default-user-profile.png">
            <div v-if="dropdownVisible" class="absolute top-0 right-0 mt-2">
              <ul class="custom-hover bg-white border rounded shadow-lg">
                <li v-if="person.profileImage">
                  <a href="#" class="block px-4 py-2 hover:bg-gray-200" @click="viewProfileImage">View Profile Image</a>
                </li>
                <li>
                  <a href="#" class="block px-4 py-2 hover:bg-gray-200" @click="viewUploadProfileImage">Choose Profile Image</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div v-if="person.households && person.households[0]" class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover_shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center px-10 py-8">
            <h2 class="grow text-gray-700">{{person.lastName}} Household</h2>
            <button class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover_border-gray-200 text-gray-400 bg-transparent hover_bg-gray-50 transition-all">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div><img class="w-full" :src="person.households && person.households[0] ? getHouseholdImageUrl(person.households[0]) : null">
          <div>
            <template v-if="!isLoadingPerson && person">
              <template v-if="person.households && person.households[0]">
                <template v-if="person.households[0].people">
                  <!--each householdPerson in person.householdsArray[0].people-->
                  <div>
                    <div v-for="(householdPerson, index) in person.households[0].people" :key="householdPerson.id">
                      <div class="flex shrink items-center p-4 gap-3 odd_bg-gray-50 even_bg-white"><img class="rounded-lg" :src="getPersonImageUrl(householdPerson)" width="82">
                        <div class="flex flex-col">
                          <div class="inline-flex items-center" title="Primary contact">
                            <router-link  class="mr-2" :to="{name: 'person', params: {id: householdPerson.id} }">{{ householdPerson.firstName + " " + householdPerson.lastName }}</router-link>
                            <svg v-if="householdPerson.id == person.households[0].leader.id" class="text-sky-500" style="width:16px;height:16px" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path>
                            </svg>
                          </div>
                          <div class="text-sm text-gray-400"><p v-if="householdPerson.gender" style="display:inline">{{ householdPerson.gender }} </p><p v-if="householdPerson.dateOfBirth" style="display:inline"> ({{ $filters.durationInYearsOrMonths(householdPerson.dateOfBirth) }} old)</p></div>
                          <div v-if="householdPerson.mobileNumber" class="inline-flex items-center">
                            <svg class="mr-1 text-gray-400" style="width:14px;height:14px" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"></path>
                            </svg>
                            <div class="text-sm text-gray-400">{{householdPerson.mobileNumber}}</div>
                          </div>
                          <div v-if="householdPerson.email" class="inline-flex items-center">
                            <svg class="mr-1 text-gray-400" style="width:14px;height:14px" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"></path>
                            </svg>
                            <div class="text-sm text-gray-400">{{householdPerson.email}}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
            </template>
            <!--template v-else>
              <p>Got here 1</p>
            </template>
            <template v-if="!person">
              <p>Got here 2</p>
            </template-->
          </div>
        </div>
        <div class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover_shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center px-10 py-8">
            <h2 class="grow text-gray-700">Private Notes</h2>
            <button class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover_border-gray-200 text-gray-400 bg-transparent hover_bg-gray-50 transition-all">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <div class="text-sm font-bold text-gray-500 px-10">All Stewards only</div>
          <div class="text-sm text-gray-500 px-10 mb-6">Haven’t been to church in 2 months. Need to check in.
            <div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Profile Image View -->
  <div v-if="profileImageViewVisible" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
    <div class="bg-white p-4 rounded-lg shadow-lg relative max-w-3xl overflow-hidden">
      <button @click="closeProfileImageView" class="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl">×</button>
      <div class="flex items-center justify-center">
        <img :src="getPersonImageUrl(person)" class="w-auto reduce-height" alt="Profile Image">
      </div>
    </div>
  </div>
  <div v-if="uploadProfileImage" class="fixed inset-0 flex items-center justify-center justify-around bg-gray-800 bg-opacity-75">
    <ImageCropperUploader @cropped="handleCroppedImage" :uploadEndpoint="'/people/profile_image?id=' + person.id"
                          @imageCropperCancelled="closeUploadProfileImageView"
                          @imageCropperUploadedSuccess="handleImageUploadedSuccess"
                          @imageCropperUploadFailed="handleImageUploadFailed" />

    <div v-if="croppedImage">
      <h2>Cropped Image Preview</h2>
      <img :src="croppedImage" alt="Cropped Image" />
    </div>
  </div>
</template>


<style>
.hover-brightness:hover {
  filter: brightness(1.1); /* Adjust the value to control brightness on hover */
}

/* Style the list items within the dropdown */
ul.custom-hover li:hover {
  background-color: lightgrey; /* Change to the desired hover background color */
  cursor: pointer;
}

div.reduce-height {
  max-height: 720px;
}

img.reduce-height {
  max-height: 720px;
}

img.reduce-height-in-panel {
  max-height: 580px;
}

</style>