<script setup lang="ts">

import {ref, inject, onMounted} from 'vue'
import {useRoute, onBeforeRouteUpdate} from 'vue-router'
import {useRepo} from 'pinia-orm'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Toaster from '@/components/Widgets/Toaster.vue'
import Person from '@/models/Person'
import ImageCropperUploader from '../../components/ImageCropperUploader.vue';
import {getPersonImageUrl, getHouseholdImageUrl} from '@/imageUtils';
import Household from "@/models/Household";
import AddressDisplay from '../../components/AddressDisplay.vue';
import UserProfilePopup from '../../components/people/UserProfilePopup.vue';


const axios = inject('axios')

const route = useRoute()
const personRepo = useRepo(Person)

const isLoadingHousehold = ref(true)
const showLoadingError = ref(false)
const household = ref(null)

const hovered = ref(false);
const dropdownVisible = ref(false);
const householdImageViewVisible = ref(false)
const uploadHouseholdImage = ref(false)
const croppedImage = ref(null);
const uploadHouseholdImageFailed = ref(false);
const uploadHouseholdImageSuccess = ref(false);

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

const handleCroppedImage = (dataUrl) => {
  croppedImage.value = dataUrl;
};

const loadHousehold = (id) => {
  console.log('loadHousehold');
  axios
      .get('/households/' + id)
      .then(response => {

        useRepo(Household).save(response.data)
        household.value = useRepo(Household).find(+id)
        // TODO: remove timeout later
        setTimeout(() => {
          isLoadingHousehold.value = false
        }, 2000)
      })
      .catch((err) => {
        console.log(err)

        showLoadingError.value = true
      })
}

loadHousehold(route.params.id)

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
  loadHousehold(to.params.id)
})

const viewHouseholdImage = () => {
  householdImageViewVisible.value = true;
  // Prevent scrolling
  document.body.style.overflow = 'hidden';
};

const closeHouseholdImageView = () => {
  householdImageViewVisible.value = false;

  // Allow scrolling again
  document.body.style.overflow = 'auto';
}

const viewUploadHouseholdImage = () => {
  uploadHouseholdImage.value = true;
  // Prevent scrolling
  document.body.style.overflow = 'hidden';
};

const closeUploadHouseholdImageView = () => {
  uploadHouseholdImage.value = false;

  // Allow scrolling again
  document.body.style.overflow = 'auto';
}

const handleImageUploadedSuccess = () => {
  uploadHouseholdImage.value = false;
  uploadHouseholdImageSuccess.value = true;
  setTimeout(() => {
    uploadHouseholdImageSuccess.value = false;
  }, 3000);

  if (household && household.value)
    loadHousehold(household.value.id)

  document.body.style.overflow = 'auto';

}

const handleImageUploadFailed = () => {
  uploadHouseholdImage.value = false;
  setTimeout(() => {
    uploadHouseholdImageFailed.value = false;
  }, 8000);
  uploadHouseholdImageFailed.value = true;

  document.body.style.overflow = 'auto';

}
</script>

<template>
  <Toaster message="Couldn't retrieve the household. Please try again later." type="error" :show="showLoadingError"
           @close="showLoadingError = false"></Toaster>
  <Toaster message="Uploading of household image failed" type="error" :show="uploadHouseholdImageFailed"
           @close="uploadHouseholdImageFailed = false"></Toaster>
  <Toaster message="New Household Image Uploaded" type="success" :show="uploadHouseholdImageSuccess"
           @close="uploadHouseholdImageSuccess = false"></Toaster>


  <div class="ml-menu py-main-tb" id="household">
    <div class="flex items-center px-main-lr mb-10 relative">
      <router-link
          class="absolute -ml-8 no-underline text-gray-600 font-bold text-lg hover_pr-2 hover_-ml-9 transition-all"
          :to="{ name: 'people' }">
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z"></path>
        </svg>
      </router-link>
      <h1 class="grow text-gray-600">
        <Skeletor v-if="isLoadingHousehold" width="350"></Skeletor>
        <template v-else>{{ household.leader.lastName }} Household</template>
      </h1>
      <button
          class="w-10 h-8 inline-flex justify-center items-center rounded-md border border-sky-400 hover_border-sky-300 text-sky-400 bg-transparent hover_bg-sky-50 transition-all">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24">
          <path fill="currentColor"
                d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"></path>
        </svg>
      </button>
    </div>
    <div class="flex px-main-lr gap-5">
      <div class="flex flex-col gap-5 w-3/5">
        <div
            class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover_shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center px-10 py-8">
            <h2 class="grow text-gray-700">Household Information</h2>
            <button
                class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover_border-gray-200 text-gray-400 bg-transparent hover_bg-gray-50 transition-all">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor"
                      d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <table class="table-auto w-full text-left text-sm">
            <tbody>
            <tr class="odd_bg-gray-50 even_bg-white">
              <td class="py-4 pl-10 text-gray-500 w-2/5">Leader</td>
              <td class="py-4">
                <Skeletor v-if="isLoadingHousehold" width="350"></Skeletor>
                <template v-else>{{ household.leader.firstName }} {{ household.leader.lastName }}</template>
              </td>
            </tr>
            <div
                class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover_shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <div class="flex items-center px-10 py-8">
                <h2 class="grow text-gray-700">Address</h2>
                <button
                    class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover_border-gray-200 text-gray-400 bg-transparent hover_bg-gray-50 transition-all">
                  <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                    <path fill="currentColor"
                          d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
                  </svg>
                </button>
              </div>
              <div class="address px-10 mb-4 text-gray-500 text-sm" v-if="household && household.addresses">
                <AddressDisplay :address="household.addresses"
                                addressFormat="[[streetNumber]] [[street]] [[newline]] [[suburb]], [[city]], [[postalCode]]"/>
                <div class="w-full h-60" id="map"></div>
              </div>
            </div>
            </tbody>
          </table>
        </div>
        <div class="flex flex-col gap-5 w-2/5">
          <div class="flex items-center justify-center">
            <div @click="toggleDropdown" class="relative"
                 @mouseenter="hovered = true"
                 @mouseleave="hovered=false, dropdownVisible = false ">

              <img
                  class="rounded-lg reduce-height-in-panel cursor-pointer transition-transform duration-300 transform hover:scale-110 hover-brightness"
                  v-if="household.householdImage"
                  :src="getHouseholdImageUrl(household)">
              <img
                  class="rounded-lg w-full cursor-pointer transition-transform duration-300 transform hover:scale-110 hover-brightness"
                  v-else
                  src="@/assets/default-user-profile.png">
              <div v-if="dropdownVisible" class="absolute top-0 right-0 mt-2">
                <ul class="custom-hover bg-white border rounded shadow-lg">
                  <li v-if="household.householdImage">
                    <a href="#" class="block px-4 py-2 hover:bg-gray-200" @click="viewHouseholdImage">View Household
                      Image</a>
                  </li>
                  <li>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-200" @click="viewUploadHouseholdImage">Choose
                      Household Image</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div
              class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover_shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
            <div class="flex items-center px-10 py-8">
              <h2 class="grow text-gray-700">Private Notes</h2>
              <button
                  class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover_border-gray-200 text-gray-400 bg-transparent hover_bg-gray-50 transition-all">
                <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                  <path fill="currentColor"
                        d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
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
  </div>
  <!-- Profile Image View -->
  <div v-if="householdImageViewVisible"
       class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
    <div class="bg-white p-4 rounded-lg shadow-lg relative max-w-3xl overflow-hidden">
      <button @click="closeHouseholdImageView"
              class="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl">×
      </button>
      <div class="flex items-center justify-center">
        <img :src="getHouseholdImageUrl(person)" class="w-auto reduce-height" alt="Profile Image">
      </div>
    </div>
  </div>
  <div v-if="uploadHouseholdImage"
       class="fixed inset-0 flex items-center justify-center justify-around bg-gray-800 bg-opacity-75">
    <ImageCropperUploader @cropped="handleCroppedImage" :uploadEndpoint="'/households/household_image'"
                          @imageCropperCancelled="closeUploadHouseholdImageView"
                          @imageCropperUploadedSuccess="handleImageUploadedSuccess"
                          @imageCropperUploadFailed="handleImageUploadFailed"/>

    <div v-if="croppedImage">
      <h2>Cropped Image Preview</h2>
      <img :src="croppedImage" alt="Cropped Image"/>
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