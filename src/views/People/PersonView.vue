<script setup lang="ts">

import type { AxiosInstance } from 'axios'
import { ref, inject, onMounted} from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useRepo } from 'pinia-orm'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Toaster from '@/components/Widgets/Toaster.vue'
import Person from '@/models/Person'
import ImageCropperUploader from '../../components/ImageCropperUploader.vue';
import { getPersonImageUrl, getHouseholdImageUrl } from '@/imageUtils';
import AddressDisplay from '../../components/AddressDisplay.vue';
import UserProfilePopup from '../../components/people/UserProfilePopup.vue';


const axios = inject<AxiosInstance>('axios')

const route = useRoute()

const isLoadingPerson = ref(true)
const showLoadingError = ref(false)
const person = ref<Person | null>(null)

const hovered = ref(false);
const dropdownVisible = ref(false);
const profileImageFailed = ref(false)
const profileImageViewVisible = ref(false)
const uploadProfileImage = ref(false)
const croppedImage = ref<string | null>(null);
const uploadProfileImageFailed = ref(false);
const uploadProfileImageSuccess = ref(false);

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

const handleCroppedImage = (dataUrl) => {
  croppedImage.value = dataUrl;
};

const labelize = (value) => {
  if (!value) return ''
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const formatCustomValue = (value) => {
  if (Array.isArray(value)) return value.join(', ')
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

const loadPerson = (id) => {
  isLoadingPerson.value = true
  profileImageFailed.value = false
  Promise.all([
    axios.get('/people/' + id),
    axios.get(`/people/${id}/groups`).catch(() => ({ data: [] })),
    axios.get(`/people/${id}/relationships`).catch(() => ({ data: [] })),
  ])
      .then(([personResponse, groupsResponse, relationshipsResponse]) => {
        useRepo(Person).save({
          ...personResponse.data,
          groups: groupsResponse.data || [],
          relationships: relationshipsResponse.data || [],
        })
        person.value = useRepo(Person).find(+id)
        isLoadingPerson.value = false
      })
      .catch((err) => {
        console.log(err)
        showLoadingError.value = true
        isLoadingPerson.value = false
      })
}

loadPerson(route.params.id)

onMounted(() => {
  // Check if the map element already has a map associated with it
  if (document.getElementById('map') && !document.getElementById('map')._leaflet_id) {
    const map = L.map('map', {
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

  if(person.value && person.value)
    loadPerson(person.value.id)

  document.body.style.overflow = 'auto';

}

const handleImageUploadFailed = () => {
  uploadProfileImage.value = false;
  setTimeout(() => {
    uploadProfileImageFailed.value = false;
  }, 8000);
  uploadProfileImageFailed.value = true;

  document.body.style.overflow = 'auto';

}
</script>

<template>
  <Toaster message="Couldn't retrieve the user. Please try again later." type="error" :show="showLoadingError" @close="showLoadingError = false"></Toaster>
  <Toaster message="Uploading of image failed" type="error" :show="uploadProfileImageFailed" @close="uploadProfileImageFailed = false"></Toaster>
  <Toaster message="New Profile Image Uploaded" type="success" :show="uploadProfileImageSuccess" @close="uploadProfileImageSuccess = false" ></Toaster>

  <div class="app-page" id="person">
    <div class="app-page-header">
      <router-link class="inline-flex shrink-0 no-underline text-gray-600 font-bold text-lg transition-all hover:text-sky-500" :to="{ name: 'people' }" aria-label="Back to people">
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z"></path>
        </svg>
      </router-link>
      <h1 class="grow min-w-0 text-gray-600 break-words">
        <Skeletor v-if="isLoadingPerson" width="200"></Skeletor>
        <template v-else>
          <span class="inline-flex flex-wrap items-center gap-2">
            {{ person.displayName }}
            <span v-if="person.lifecycleStatus" class="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800">{{ labelize(person.lifecycleStatus) }}</span>
          </span>
        </template>
      </h1>
      <button class="w-10 h-8 inline-flex shrink-0 justify-center items-center rounded-md border border-sky-400 hover:border-sky-300 text-sky-400 bg-transparent hover:bg-sky-50 transition-all">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"></path>
        </svg>
      </button>
    </div>
    <div class="app-detail-grid">
      <div class="app-detail-primary order-2 lg:order-1">
        <div class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center app-panel-pad py-6 sm:py-8">
            <h2 class="grow text-gray-700">Basic Information</h2>
            <button class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover:border-gray-200 text-gray-400 bg-transparent hover:bg-gray-50 transition-all">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <table class="table-auto w-full text-left text-sm">
            <tbody>
              <tr class="odd:bg-gray-50 even:bg-white" v-if="!isLoadingPerson && (person?.preferredName || person?.title || person?.middleName)">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Name</td>
                <td class="py-4 pr-4 break-words">
                  <span v-if="person.title">{{ person.title }}&nbsp;</span>{{ person.firstName }}
                  <span v-if="person.middleName"> {{ person.middleName }}</span>
                  {{ person.lastName }}
                  <span v-if="person.preferredName && person.preferredName !== person.firstName" class="text-gray-400"> · goes by {{ person.preferredName }}</span>
                </td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Date of birth</td>
                <td class="py-4">
                  <Skeletor v-if="isLoadingPerson" width="200"></Skeletor>
                  <template v-else-if="!!person.dateOfBirth">{{ $filters.humanDate(person.dateOfBirth) }} ({{ $filters.durationInYearsOrMonths(person.dateOfBirth) }} old)</template>
                </td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Gender</td>
                <td class="py-4">
                  <Skeletor v-if="isLoadingPerson" width="80"></Skeletor>
                  <template v-else>{{ person?.gender }}</template>
                </td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Marital status</td>
                <td class="py-4">
                  <Skeletor v-if="isLoadingPerson" width="200"></Skeletor>
                  <template v-else>{{ person?.maritalStatus }}
                    <template v-if="!!person.marriageDate">

                      ({{ $filters.humanDate(person.marriageDate) }} - {{ $filters.durationInYearsOrMonths(person.marriageDate) }})
                    </template>
                  </template>
                </td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Email address</td>
                <td class="py-4 pr-4">
                  <Skeletor v-if="isLoadingPerson" width="160"></Skeletor>
                  <ul v-else-if="person?.emails?.length" class="space-y-1">
                    <li v-for="item in person.emails" :key="item.id || item.email" class="break-all">
                      {{ item.email }}
                      <span v-if="item.isPrimary" class="ml-1 text-xs font-medium text-sky-700">Primary</span>
                    </li>
                  </ul>
                  <span v-else class="break-all">{{ person?.email }}</span>
                </td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Phone number</td>
                <td class="py-4 pr-4">
                  <Skeletor v-if="isLoadingPerson" width="120"></Skeletor>
                  <ul v-else-if="person?.phones?.length" class="space-y-1">
                    <li v-for="item in person.phones" :key="item.id || item.number" class="break-all">
                      {{ item.number }}
                      <span class="text-gray-400">{{ labelize(item.phoneType) }}</span>
                      <span v-if="item.isPrimary" class="ml-1 text-xs font-medium text-sky-700">Primary</span>
                    </li>
                  </ul>
                  <span v-else class="break-all">{{ person?.mobileNumber }}</span>
                </td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Social profiles</td>
                <td class="py-4 pr-4">
                  <Skeletor v-if="isLoadingPerson" width="100"></Skeletor>
                  <template v-else-if="person?.socialMediaLinks?.length">
                    <a v-for="link in person.socialMediaLinks" :key="link.url" class="mr-3 break-all" :href="link.url" target="_blank" rel="noreferrer">{{ link.type || link.url }}</a>
                  </template>
                  <span v-else class="text-gray-400">—</span>
                </td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 align-top">Registered at</td>
                <td class="py-4">
                  <Skeletor v-if="isLoadingPerson" width="230"></Skeletor>
                  <template v-else-if="!!person.registeredDate">{{ $filters.humanDate(person.registeredDate) }} ({{ $filters.humanize(person.registeredDate) }} ago)</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center app-panel-pad py-6 sm:py-8">
            <h2 class="grow text-gray-700">Church Life</h2>
            <button class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover:border-gray-200 text-gray-400 bg-transparent hover:bg-gray-50 transition-all">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <table class="table-auto w-full text-left text-sm">
            <tbody>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Status</td>
                <td class="py-4 pr-4">{{ labelize(person?.lifecycleStatus) || '—' }}<span v-if="person?.membershipStatus && person.membershipStatus !== person.lifecycleStatus"> · {{ labelize(person.membershipStatus) }}</span></td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Member since</td>
                <td class="py-4 pr-4">{{ person?.memberSince ? $filters.humanDate(person.memberSince) : '—' }}</td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Baptism</td>
                <td class="py-4 pr-4 break-words">
                  <template v-if="person?.baptismStatus || person?.baptismDate || person?.baptismLocation">
                    {{ labelize(person.baptismStatus) }}
                    <span v-if="person.baptismDate"> · {{ $filters.humanDate(person.baptismDate) }}</span>
                    <span v-if="person.baptismLocation"> · {{ person.baptismLocation }}</span>
                  </template>
                  <template v-else>—</template>
                </td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Categories</td>
                <td class="py-4 pr-4">
                  <div v-if="person?.categories?.length" class="flex flex-wrap gap-1.5">
                    <span v-for="category in person.categories" :key="category.id" class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{{ category.name }}</span>
                  </div>
                  <template v-else>—</template>
                </td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Ministry</td>
                <td class="py-4 pr-4 break-words">{{ person?.ministryInvolvement || '—' }}</td>
              </tr>
              <tr class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">Groups</td>
                <td class="py-4 pr-4">
                  <ul v-if="person?.groups?.length" class="space-y-1">
                    <li v-for="group in person.groups" :key="group.groupId">
                      <router-link :to="{ name: 'group', params: { id: group.groupId } }">{{ group.groupName }}</router-link>
                      <span v-if="group.role" class="text-gray-400"> · {{ group.role }}</span>
                    </li>
                  </ul>
                  <template v-else>—</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="person?.relationships?.length" class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div class="flex items-center app-panel-pad py-6 sm:py-8">
            <h2 class="grow text-gray-700">Family</h2>
          </div>
          <ul class="divide-y divide-gray-100 text-sm">
            <li v-for="relationship in person.relationships" :key="relationship.id" class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
              <span class="text-gray-500">{{ labelize(relationship.relationshipType) }}</span>
              <router-link v-if="relationship.relatedPersonId" :to="{ name: 'person', params: { id: relationship.relatedPersonId } }">
                {{ relationship.relatedFirstName }} {{ relationship.relatedLastName }}
              </router-link>
            </li>
          </ul>
        </div>
        <div v-if="person?.customFields?.length" class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div class="flex items-center app-panel-pad py-6 sm:py-8">
            <h2 class="grow text-gray-700">Additional details</h2>
          </div>
          <table class="table-auto w-full text-left text-sm">
            <tbody>
              <tr v-for="field in person.customFields" :key="field.fieldId" class="odd:bg-gray-50 even:bg-white">
                <td class="py-3 pl-4 sm:py-4 sm:pl-6 lg:pl-10 text-gray-500 w-2/5 align-top">{{ field.name }}</td>
                <td class="py-4 pr-4 break-words">{{ formatCustomValue(field.value) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center app-panel-pad py-6 sm:py-8">
            <h2 class="grow text-gray-700">Address</h2>
            <button class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover:border-gray-200 text-gray-400 bg-transparent hover:bg-gray-50 transition-all">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <div class="address app-panel-pad mb-4 text-gray-500 text-sm" v-if="person && person.addresses && person.addresses[0]"><AddressDisplay :address="person.addresses[0]" addressFormat="[[streetNumber]] [[street]] [[newline]] [[suburb]], [[city]], [[postalCode]]" />
            <div class="w-full h-60" id="map"></div>
          </div>
          <div class="address app-panel-pad mb-4 text-gray-500 text-sm" v-else-if="person && person.households && person.households[0] && person.households[0].address">
            <AddressDisplay :address="person.households[0].address" addressFormat="[[streetNumber]] [[street]] [[newline]] [[suburb]], [[city]], [[postalCode]]" />
            <div class="w-full h-60" id="map"></div>
          </div>
          <div v-else class="app-panel-pad mb-4 text-gray-500 text-sm">No address</div>

        </div>
        <div v-if="person?.emergencyContacts?.length" class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div class="flex items-center app-panel-pad py-6 sm:py-8">
            <h2 class="grow text-gray-700">Emergency contacts</h2>
          </div>
          <ul class="divide-y divide-gray-100">
            <li v-for="contact in person.emergencyContacts" :key="contact.id || contact.name" class="px-4 py-3 sm:px-6 lg:px-10">
              <p class="text-sm font-medium text-gray-800">{{ contact.name }}</p>
              <p class="text-xs text-gray-500">{{ labelize(contact.relationshipLabel) }}</p>
              <p v-if="contact.phone" class="mt-1 break-all text-sm text-gray-600">{{ contact.phone }}</p>
              <p v-if="contact.email" class="break-all text-sm text-gray-600">{{ contact.email }}</p>
            </li>
          </ul>
        </div>
      </div>
      <div class="app-detail-aside order-1 lg:order-2">
        <div class="flex items-center justify-center">
          <div @click="toggleDropdown" class="relative"
               @mouseenter="hovered = true"
               @mouseleave="hovered=false, dropdownVisible = false ">

            <img class="w-full max-w-sm rounded-lg reduce-height-in-panel cursor-pointer object-cover transition-transform duration-300 transform hover:scale-110 hover-brightness"
                 v-if="person && person.profileImage && !profileImageFailed"
                 :src="getPersonImageUrl(person)"
                 @error="profileImageFailed = true">
            <img class="w-full max-w-sm rounded-lg cursor-pointer transition-transform duration-300 transform hover:scale-110 hover-brightness"
                 v-else
                 src="@/assets/default-user-profile.png">
            <div v-if="dropdownVisible" class="absolute top-0 right-0 mt-2">
              <ul class="custom-hover bg-white border rounded shadow-lg">
                <li v-if="person && person.profileImage">
                  <a href="#" class="block px-4 py-2 hover:bg-gray-200" @click="viewProfileImage">View Profile Image</a>
                </li>
                <li>
                  <a href="#" class="block px-4 py-2 hover:bg-gray-200" @click="viewUploadProfileImage">Choose Profile Image</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div v-if="person && person.households && person.households[0]" class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center app-panel-pad py-6 sm:py-8">
            <router-link  class="grow" :to="{name: 'household', params: {id: person.households[0].id} }">
              <h2 class="text-gray-700">{{ person.households[0].name || (person.lastName + ' Household') }}</h2>
            </router-link>
              <button class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover:border-gray-200 text-gray-400 bg-transparent hover:bg-gray-50 transition-all">
                <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
                </svg>
              </button>
          </div>
          <img class="w-full" :src="person.households && person.households[0] ? getHouseholdImageUrl(person.households[0]) : null">
          <div>
            <template v-if="!isLoadingPerson && person">
              <template v-if="person && person.households && person.households[0]">
                <template v-if="person.households[0].people">
                  <!--each householdPerson in person.householdsArray[0].people-->
                  <div>
                    <div v-for="householdPerson in person.households[0].people" :key="householdPerson.id">
                      <div class="flex shrink items-center p-4 gap-3 odd:bg-gray-50 even:bg-white">
                        <UserProfilePopup
                            :person="householdPerson"
                            :includeName="true">
                          <template v-slot:default="{ getPersonImageUrl }">
                              <img class="rounded-lg" v-if="householdPerson && householdPerson.profileImage" :src="getPersonImageUrl(householdPerson)" width="82">
                              <img class="rounded-lg" v-else src="@/assets/default-user-profile.png" width="82">
                          </template>
                        </UserProfilePopup>
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
                            <div class="min-w-0 break-all text-sm text-gray-400">{{householdPerson.email}}</div>
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
        <div class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center app-panel-pad py-6 sm:py-8">
            <h2 class="grow text-gray-700">Notes</h2>
          </div>
          <div v-if="person?.pastoralNotes" class="app-panel-pad mb-4">
            <div class="text-xs font-medium uppercase tracking-wide text-gray-400">Pastoral</div>
            <p class="mt-1 whitespace-pre-wrap text-sm text-gray-600">{{ person.pastoralNotes }}</p>
          </div>
          <div v-if="person?.biography" class="app-panel-pad mb-6">
            <div class="text-xs font-medium uppercase tracking-wide text-gray-400">Biography</div>
            <p class="mt-1 whitespace-pre-wrap text-sm text-gray-600">{{ person.biography }}</p>
          </div>
          <p v-if="!person?.pastoralNotes && !person?.biography" class="app-panel-pad mb-6 text-sm text-gray-400">No notes yet.</p>
        </div>
      </div>
    </div>
  </div>
  <!-- Profile Image View -->
  <div v-if="profileImageViewVisible" class="fixed inset-0 flex items-center justify-center bg-gray-800/75 p-4">
    <div class="bg-white p-4 rounded-lg shadow-lg relative w-full max-w-3xl overflow-hidden">
      <button @click="closeProfileImageView" class="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl">×</button>
      <div class="flex items-center justify-center">
        <img :src="getPersonImageUrl(person)" class="w-auto reduce-height" alt="Profile Image">
      </div>
    </div>
  </div>
  <div v-if="uploadProfileImage" class="fixed inset-0 flex items-center justify-center justify-around bg-gray-800/75 p-4">
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
  max-height: min(70vh, 720px);
}

img.reduce-height {
  max-height: min(70vh, 720px);
  max-width: 100%;
  height: auto;
}

img.reduce-height-in-panel {
  max-height: min(50vh, 580px);
  height: auto;
}

</style>
