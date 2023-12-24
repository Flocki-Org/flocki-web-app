
<script setup>
import {ref, watch, defineProps, defineEmits, computed, inject} from 'vue';
import {useRepo} from "pinia-orm";
import Person from "@/models/Person";
import { getPersonImageUrl } from '@/imageUtils';

const emit = defineEmits(['person-selected']);

const axios = inject('axios')
const { householdId } = defineProps([
  'householdId',
])
const userSearchInput = ref('');
const showPeopleList = ref(false);
const selectedPerson = ref(null);
const matchingPeople = computed(() => {
  return useRepo(Person).all()
})


const handleInput = () => {
  selectedPerson.value = null;
  if (userSearchInput.value.length >= 2) {
    const [name, surname] = userSearchInput.value.split(' ');
    fetchPeople(name, surname);
  } else {
    matchingPeople.value = [];
    showPeopleList.value = false; // Hide the people list
  }
};

const fetchPeople = async (name, surname) => {
  try {
    // Make an API request to fetch people
    console.log(name, surname)
    let url = ''
    if (name && surname) {
      url = `/households/people?name=${name}&surname=${surname}&household_id=${householdId}`
    } else if (name) {
      url = `/households/people?name=${name}&household_id=${householdId}`
    } else if (surname) {
      url = `/households/people?surname=${surname}&household_id=${householdId}`
    }
    console.log(url);
    axios
        .get(url)
        .then(response => {
          console.log(response);
          // Clear the existing matchingPeople
          useRepo(Person).flush();
          selectedPerson.value = null;
          useRepo(Person).save(response.data)
          showPeopleList.value = true;
        });

  } catch (error) {
    // Handle errors
    selectedPerson.value = null;
  }
};

const selectPerson = (person) => {
  emit('person-selected', person); // Emit the "person-selected" event with the selected person
  //set input to full name of person selected
  userSearchInput.value = `${person.firstName} ${person.lastName}`;
  showPeopleList.value = false; // Hide the people list
  selectedPerson.value = person;
};

const clearInput = () => {
  userSearchInput.value = ''; // Clear the input when the clear icon is clicked
  showPeopleList.value = false; // Hide the people list
  useRepo(Person).flush();
  selectedPerson.value = null;
};

</script>


<template>
  <div class="autocomplete-container">
    <div class="autocomplete-dropdown">
      <div class="w-full flex items-center">

        <input
            class="outline-none bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:border-blue-300 focus:visible:border-blue-300 block w-64 p-3 pr-12"
            type="text"
            v-model="userSearchInput"
            @input="handleInput"
            @click="showPeopleList = true"
            :style="{ paddingLeft: selectedPerson ? '50px' : '10px' }"
        />
        <span v-if="selectedPerson" class="absolute left-3 top-1/2 transform -translate-y-1/2">
              <img class="w-8 h-8 mr-1 rounded-full inline" v-if="selectedPerson && selectedPerson.profileImage" :src="getPersonImageUrl(selectedPerson)" >
              <img class="w-8 h-8 rounded-full inline" v-else src="@/assets/default-user-profile.png">
      </span>


        <span
            class="clear-icon"
            @click="clearInput"
            v-if="userSearchInput"
        >
          <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
                      <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
        </span>
      <div class="dropdown-container" v-show="showPeopleList">
        <ul class="dropdown-list">
          <li
              v-for="person in matchingPeople"
              :key="person.id"
              @click="selectPerson(person)"
          >

            <img class="w-8 h-8 mr-1 rounded-full inline" v-if="person && person.profileImage" :src="getPersonImageUrl(person)" :title="person.firstName">
            <img class="w-8 h-8 rounded-full inline" v-else src="@/assets/default-user-profile.png" :title="person.firstName">

            {{ person.firstName }} {{ person.lastName }}
          </li>
        </ul>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>

.autocomplete-container {
  position: relative; /* Set the position to relative */
  width: 100%;
  z-index: 10000;
}

.autocomplete-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-container {
  background-color: #ffffff;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 100px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  list-style-type: none;
  z-index: 10001;  scrollbar-width: thin; /* Width of the scrollbar track */
  scrollbar-color: #ccc #f0f0f0; /* Track and thumb color */
}

.dropdown-container::-webkit-scrollbar {
  width: 8px; /* Width of the scrollbar track */
}

.dropdown-container::-webkit-scrollbar-thumb {
  background: #ccc; /* Thumb color */
  border-radius: 8px;
}

.clear-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #ccc;
  font-size: 18px;
}

.clear-icon:hover {
  color: #f00;
}



.dropdown-list {
  list-style-type: none;
}

.dropdown-list li {
  padding: 5px;
  cursor: pointer;
}

.dropdown-list li:hover {
  background-color: #f0f0f0;
}

.selected-person-image {
  position: absolute;
  left: 10px; /* Adjust the left position as needed */
  top: 50%; /* Vertically center the image */
  transform: translateY(-50%); /* Vertically center the image */
}

</style>
