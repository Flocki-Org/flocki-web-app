<script setup lang="ts">

import {ref, inject, onMounted, onBeforeUnmount} from 'vue'
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
import Input from "@/components/Forms/Input.vue";
import Button from "@/components/Forms/Button.vue";
import Dialog from "@/components/Widgets/Dialog.vue";
import Label from "@/components/Forms/Label.vue";
import UserSelect from "@/components/people/UserSelect.vue";


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
const memberRemovalSuccess = ref(false);
const memberPromotedSuccess = ref(false);

const isOpenAddMemberDialog = ref(false);
const isAddingMember = ref(false);
const newmember = ref(null);

const visibleDeleteIcons = ref([]);

const showDeleteIcon = (event, memberId) => {
  event.stopPropagation();

  // Hide all delete icons first
  if(household && household.value && household.value.people) {
    visibleDeleteIcons.value = Array(household.value.people.length).fill(false);

    // Show delete icon for the clicked member
    visibleDeleteIcons.value[memberId] = true;
  }
};

const clearAllDeleteIcons = () => {
  visibleDeleteIcons.value = Array(household.value.people.length).fill(false);
};

const isDeleteIconVisible = (memberId) => {
  // Check if delete icon is visible for a specific member
  return visibleDeleteIcons.value[memberId] || false;
};

const promoteMemberToLeader = (memberId) => {
  // Implement logic to promote the member to leader
  // You can use household.leader = member
  //check if member is leader and if so don't allow removal
  if (household.value.leader.id === memberId) {
    //show alert dialog with name of leader
    alert(household.value.people.find(person => person.id === memberId).firstName + ' ' +
        household.value.people.find(person => person.id === memberId).lastName + 'is already the leader');
    return;
  }

  //check if user is sure of removal. show name
  if (!confirm('Are you sure you want to promote ' + household.value.people.find(person => person.id === memberId).firstName +
      ' ' + household.value.people.find(person => person.id === memberId).lastName + ' to leader of the household?')) {
    return;
  }

  //do put to households endpoint with id as url param, newmember is already added to list above
  let udpatedHousehold = {
    id: household.value.id,
    address_id: household.value.address.id,
    people_ids: household.value.people.map(person => person.id),
    household_image_id: household.value.householdImage ? household.value.householdImage.id : null,
    leader_id: memberId
  }

  axios
      .put('/households?id=' + household.value.id, udpatedHousehold)
      .then(response => {
        console.log(response);
        loadHousehold(household.value.id);
        memberPromotedSuccess.value = true;
        clearAllDeleteIcons();
        setTimeout(() => {
          memberPromotedSuccess.value = false;
        }, 3000);
      })
      .catch((err) => {
        console.log(err)
        clearAllDeleteIcons();
      })
}

const removeMember = (memberId) => {
  // Implement logic to remove the member from the household
  // You can use household.people.splice(index, 1) or any other method
  //check if member is leader and if so don't allow removal
  if (household.value.leader.id === memberId) {
    //show alert dialog
    alert('Cannot remove leader from household')
    return;
  }

  //check if user is sure of removal. show name
  if (!confirm('Are you sure you want to remove ' + household.value.people.find(person => person.id === memberId).firstName +
      ' ' + household.value.people.find(person => person.id === memberId).lastName + ' from the household?')) {
    return;
  }
  //remove member from household
  household.value.people = household.value.people.filter(person => person.id !== memberId)
  //do put to households endpoint with id as url param, newmember is already added to list above
  let udpatedHousehold = {
    id: household.value.id,
    address_id: household.value.address.id,
    people_ids: household.value.people.map(person => person.id),
    household_image_id: household.value.householdImage ? household.value.householdImage.id : null,
    leader_id: household.value.leader.id
  }
  axios
      .put('/households?id=' + household.value.id, udpatedHousehold)
      .then(response => {
        console.log(response);
        loadHousehold(household.value.id);
        memberRemovalSuccess.value = true;
        clearAllDeleteIcons();
        setTimeout(() => {
          memberRemovalSuccess.value = false;
        }, 3000);
      })
      .catch((err) => {
        clearAllDeleteIcons();
        console.log(err)
      })
  console.log('Remove member with ID:', memberId);
};

const toggleAddMemberDialog = (event) => {
  event.stopPropagation();

  isOpenAddMemberDialog.value = !isOpenAddMemberDialog.value;
  console.log(isOpenAddMemberDialog);
}


onBeforeUnmount(() => {
  // Remove the click event listener when the component is unmounted
  document.body.removeEventListener('click', clearAllDeleteIcons);
});

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

const handleCroppedImage = (dataUrl) => {
  croppedImage.value = dataUrl;
};

const handlePersonSelected = (person: Person) => {
  console.log('Selected person:', person);
  newmember.value = person;
}

const loadHousehold = (id) => {
  console.log('loadHousehold');
  axios
      .get('/households/' + id)
      .then(response => {

        useRepo(Household).save(response.data)
        household.value = useRepo(Household).find(+id) as Household;
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

const addMemberToHousehold = (id) => {

  isAddingMember.value = true;
  household.value.people.push(newmember.value);
  /* create a household from household but with the following fields

   id: int
    address_id: int = Field("An address")
    people_ids: List[int] = Field(title="A list of IDs of the people to be added to the household")
    household_image_id: int = Field(None, title="The ID of the image of this household")
    leader_id:
   */
  let udpatedHousehold = {
    id: household.value.id,
    address_id: household.value.address.id,
    people_ids: household.value.people.map(person => person.id),
    household_image_id: household.value.householdImage ? household.value.householdImage.id : null,
    leader_id: household.value.leader.id
  }
  //do put to households endpoint with id as url param, newmember is already added to list above
  axios
      .put('/households?id=' + household.value.id, udpatedHousehold)
      .then(response => {
        console.log(response);
        isAddingMember.value = false;
        isOpenAddMemberDialog.value = false;
        loadHousehold(household.value.id);
      })
      .catch((err) => {
        console.log(err)
        isAddingMember.value = false;
        isOpenAddMemberDialog.value = false;
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
  document.body.addEventListener('click', clearAllDeleteIcons);

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
  <Toaster message="Household member removed from household" type="success" :show="memberRemovalSuccess"
           @close="memberRemovalSuccess = false"></Toaster>
  <Toaster message="Household member promoted to leader" type="success" :show="memberPromotedSuccess"
           @close="memberPromotedSuccess = false"></Toaster>

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

                <template v-else>
                  <UserProfilePopup
                      :person="household.leader"
                      :includeName="false">
                    <template v-slot:default="{ getPersonImageUrl }">
                      <img class="w-12 h-12 mr-1 rounded-full inline cursor-pointer" v-if="household && household.leader && household.leader.profileImage" :src="getPersonImageUrl(household.leader)">
                      <img class="w-12 h-12 rounded-full inline cursor-pointer" v-else src="@/assets/default-user-profile.png">

                    </template>
                  </UserProfilePopup> </template>
              </td>
            </tr>
            <tr class="odd_bg-gray-50 even_bg-white">
              <td class="py-4 pl-10 text-gray-500 w-2/5">Household Members</td>
              <td class="py-4">
                <Skeletor v-if="isLoadingHousehold" width="350"></Skeletor>
                <template v-else>
                  <div class="flex items-center">

  <div>
    <div
      v-for="member in household.people"
      :key="member.id"
      class="inline relative"
      @click="showDeleteIcon($event, member.id)"
    >
      <UserProfilePopup :person="member" :include-name="true" should-prevent-default="true">
        <template v-slot:default="{ getPersonImageUrl }">
          <img
            class="h-12 w-12 mr-1 rounded-full inline cursor-pointer"
            v-if="member && member.profileImage"
            :src="getPersonImageUrl(member)"
            :class="{'border border-2 border-black': isDeleteIconVisible(member.id)}"
          />
          <img
            class="h-12 w-12 rounded-full inline cursor-pointer"
            v-else
            src="@/assets/default-user-profile.png"
            :class="{'border border-2 border-black': isDeleteIconVisible(member.id)}"
          />
        </template>
      </UserProfilePopup>

      <!-- Delete icon, initially hidden -->
      <button
        v-if="isDeleteIconVisible(member.id)"
        class="absolute top-1/2 right-9 transform -translate-y-1/2 bg-red-500 text-white rounded-full p-1 w-4 h-4 cursor-pointer flex items-center justify-center"
        @click="removeMember(member.id)"
      >
        <!-- Add your delete icon here -->
<svg width="800px" height="800px" viewBox="1 1 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="si-glyph si-glyph-delete">

    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M12.566,8 L15.611,4.956 C16.031,4.535 16.031,3.853 15.611,3.434 L12.566,0.389 C12.146,-0.031 11.464,-0.031 11.043,0.389 L7.999,3.433 L4.955,0.389 C4.534,-0.031 3.852,-0.031 3.432,0.389 L0.388,3.434 C-0.034,3.854 -0.034,4.536 0.387,4.956 L3.431,8 L0.387,11.044 C-0.034,11.465 -0.034,12.147 0.388,12.567 L3.432,15.611 C3.852,16.032 4.534,16.032 4.955,15.611 L7.999,12.567 L11.043,15.611 C11.464,16.032 12.146,16.032 12.566,15.611 L15.611,12.567 C16.031,12.146 16.031,11.464 15.611,11.044 L12.566,8 L12.566,8 Z" fill="#FFF" class="si-glyph-fill">

</path>
    </g>
</svg>
      </button>
            <button
        v-if="isDeleteIconVisible(member.id)"
        class="absolute top-1/2 left-8 transform -translate-y-1/2 bg-blue-500 text-white rounded-full p-1 w-4 h-4 cursor-pointer flex items-center justify-center"
        @click="promoteMemberToLeader(member.id)"
      >
       <svg width="800px" height="800px" viewBox="1 1 15 15" xmlns="http://www.w3.org/2000/svg" version="1.1" fill="none" stroke="#FFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
<polygon stroke-width="3" points="8 1.75,5.75 5.75,1.75 6.25,4.75 9.75,3.75 14.25,8.00 12.25,12.25 14.25,11.25 9.75,14.25 6.25,10.25 5.75"/>
</svg>
      </button>
    </div>
  </div>
                  <!-- Add a button for adding a new member -->
                  <button @click="toggleAddMemberDialog($event)" class="rounded-full bg-white border-dotted border-2 border-black w-10 h-10 flex items-center justify-center ml-1 hover:bg-blue-200 focus:outline-none">
                    <span class="text-bold text-2xl font-bold">+</span>
                  </button>
                  </div>
                </template>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
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
              <div class="address px-10 mb-4 text-gray-500 text-sm" v-if="household && household.address">
                <AddressDisplay :address="household.address"
                                addressFormat="[[streetNumber]] [[street]] [[newline]] [[suburb]], [[city]], [[postalCode]]"/>
                <div class="w-full h-60" id="map"></div>
              </div>
              <div v-else class="px-10 mb-4 text-gray-500 text-sm">No address</div>

        </div>
      </div>
      <div class="flex flex-col gap-5 w-2/5">
          <div class="flex items-center justify-center">
            <div @click="toggleDropdown" class="relative"
                 @mouseenter="hovered = true"
                 @mouseleave="hovered=false, dropdownVisible = false ">

              <img
                  class="rounded-lg reduce-height-in-panel cursor-pointer transition-transform duration-300 transform hover:scale-110 hover-brightness"
                  v-if="household && household.householdImage"
                  :src="getHouseholdImageUrl(household)">
              <img
                  class="rounded-lg w-full cursor-pointer transition-transform duration-300 transform hover:scale-110 hover-brightness"
                  v-else
                  src="@/assets/default-user-profile.png">
              <div v-if="dropdownVisible" class="absolute top-0 right-0 mt-2">
                <ul class="custom-hover bg-white border rounded shadow-lg">
                  <li v-if="household && household.householdImage">
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
        <img :src="getHouseholdImageUrl(household)" class="w-auto reduce-height" alt="Profile Image">
      </div>
    </div>
  </div>
  <div v-if="uploadHouseholdImage"
       class="fixed inset-0 flex items-center justify-center justify-around bg-gray-800 bg-opacity-75">
    <ImageCropperUploader @cropped="handleCroppedImage" :uploadEndpoint="'/households/household_image?id=' + household.id"
                          @imageCropperCancelled="closeUploadHouseholdImageView"
                          @imageCropperUploadedSuccess="handleImageUploadedSuccess"
                          @imageCropperUploadFailed="handleImageUploadFailed"/>

    <div v-if="croppedImage">
      <h2>Cropped Image Preview</h2>
      <img :src="croppedImage" alt="Cropped Image"/>
    </div>
  </div>
  <div v-if="isOpenAddMemberDialog">

    <Dialog :show="true" title="Add Member to Household" :is-form="true" :initial-focus="initialFocusRef" @close="toggleAddMemberDialog" @submit="addMemberToHousehold">
      <template #default>

      <div class="dialog-content">
        <div class="mb-4">
          <Label for-id="Person">Person</Label>
          <UserSelect @person-selected="handlePersonSelected" v-model="newmember" :household-id="household.id" peopleUrl="/households/people"></UserSelect>
        </div>
      </div>
      </template>
      <template #controls>
        <div class="flex items-center">
          <div class="grow">
            <Button stealth @click="toggleAddMemberDialog">cancel</Button>
          </div>
          <Button type="submit" :show-loader="isAddingMember">Add to Household</Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>


<style>
#map {
  z-index: 0; /* You can adjust this value based on your layout */
}

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
