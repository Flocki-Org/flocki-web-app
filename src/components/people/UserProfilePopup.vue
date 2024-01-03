<script setup>
import { ref, defineProps } from 'vue';
import { getPersonImageUrl } from '@/imageUtils';

const { personId, person, includeName, shouldPreventDefault } = defineProps([
  'personId',
  'person',
  'includeName',
  'shouldPreventDefault'
]);
const showingPersonPopupModel = ref(false);
const activeProfilePopup = ref(null);
let popupTimeout;

const showProfilePopup = (event, personId) => {
  const profileLink = event.currentTarget; // Get the router-link element
  const profilePopup = document.getElementById(`profile-popup-${personId}`);
  clearTimeout(popupTimeout);

  popupTimeout = setTimeout(() => {
    activeProfilePopup.value = personId;

    showingPersonPopupModel.value = true;
    if (profilePopup) {
      setTimeout(() => {
        const popupRect = profilePopup.getBoundingClientRect();
        const popupHeight = popupRect.height;
        const spaceAbove = profileLink.getBoundingClientRect().top;
        const spaceBelow = window.innerHeight - profileLink.getBoundingClientRect().bottom;

        let topPosition = profileLink.getBoundingClientRect().bottom; // Default position below the router-link element

        // Check if there's not enough space below, and there's enough space above
        if (spaceBelow < popupHeight && spaceAbove >= popupHeight) {
          topPosition = profileLink.getBoundingClientRect().top - popupHeight; // Display above the router-link element
          topPosition = topPosition + 5;
        } else {
          topPosition = topPosition - 5;
        }

        profilePopup.style.left = profileLink.getBoundingClientRect().left + 35 + 'px';
        profilePopup.style.top = topPosition + 'px';

      }, 0);
      // Prevent the popup from hiding when moving the mouse over the popup itself
      profilePopup.addEventListener('mouseenter', () => {
        showingPersonPopupModel.value = true;
      });
    }
    }, 800);
};

const hideProfilePopup = (event, personId) => {
  clearTimeout(popupTimeout);

  // Hide the popup unless the mouse is still over the popup
  setTimeout(() => {
    const profilePopup = document.getElementById(`profile-popup-${personId}`);
    if (!profilePopupIsHovered(event, personId) && showingPersonPopupModel.value) {
      activeProfilePopup.value = null;
      showingPersonPopupModel.value = false; // Add this line to hide the popup
    }
  }, 100);
};

const profilePopupIsHovered = (event, personId) => {

  const profilePopup = document.getElementById(`profile-popup-${personId}`);
  if (!profilePopup) return false;

  const popupRect = profilePopup.getBoundingClientRect();
  const popupTop = popupRect.top;
  const popupLeft = popupRect.left;
  const popupRight = popupRect.right;
  const popupBottom = popupRect.bottom;

  const mouseX = event.clientX;
  const mouseY = event.clientY;

  return (
      mouseX >= popupLeft &&
      mouseX <= popupRight &&
      mouseY >= popupTop &&
      mouseY <= popupBottom
  );
};

const handleLinkClick = (event) => {
  // Your logic to determine whether to prevent the default action
  console.log('handleLinkClick');
  console.log(shouldPreventDefault);
  if (shouldPreventDefault) {
    event.preventDefault();
  }
};

</script>

<template>
    <div class="user-profile-popup">
      <router-link v-if="!shouldPreventDefault" class="no-underline group-hover_underline text-current group-hover_text-sky-500" :to="{ name: 'person', params: { id: person.id } }"
                   @mouseenter="event => showProfilePopup(event, person.id)" @mouseleave="event => hideProfilePopup(event, person.id)"
                   @click="handleLinkClick">
        <div class="user-profile-container inline">
          <slot :getPersonImageUrl="getPersonImageUrl"></slot>
        </div>

      </router-link>
      <a v-else class="no-underline group-hover_underline text-current group-hover_text-sky-500" :href="`/people/${person.id}`"
         @mouseenter="event => showProfilePopup(event, person.id)" @mouseleave="event => hideProfilePopup(event, person.id)"
         @click="handleLinkClick">
        <div class="user-profile-container inline">
          <slot :getPersonImageUrl="getPersonImageUrl"></slot>
        </div>
      </a>
      <transition name="fade" mode="out-in">
        <!--template v-slot:enter="enterClass" v-slot:leave="leaveClass"-->
          <div class="profile-popup" :id="`profile-popup-${person.id}`"
               v-show="activeProfilePopup === person.id"
               @mouseleave="event => hideProfilePopup(event, person.id)">

            <router-link class="no-underline group-hover_underline text-current group-hover_text-sky-500" :to="{ name: 'person', params: { id: person.id } }">
              <img class="profile-image" v-if="person && person.profileImage" :src="getPersonImageUrl(person)">
              <img class="profile-image" v-else src="@/assets/default-user-profile.png">
            </router-link>
            <router-link class="no-underline group-hover_underline text-current group-hover_text-sky-500" :to="{ name: 'person', params: { id: person.id } }">
              <h2 class="profile-name">{{ person.firstName }} {{ person.lastName }}</h2>
            </router-link>
            <p class="profile-details"><span v-if="person.dateOfBirth">Age: {{ $filters.durationInYearsOrMonths(person.dateOfBirth) }} | Date of Birth:
              {{ $filters.humanDate(person.dateOfBirth)}} </span><span v-if="person.gender"> | Gender: {{person.gender}}</span></p>

            <p class="profile-details"> <span v-if="person.email">Email: {{ person.email }}</span><span v-if="person.email && person.mobileNumber"> | </span><span v-if="person.mobileNumber">Mobile: {{person.mobileNumber}}</span></p>
            <!-- Add other details here -->
          </div>
        <!--/template-->
      </transition>
    </div>
</template>



<style scoped>
.user-profile-container {
  display: inline-block;
  align-items: center; /* Vertically align the items */
}

.user-profile-popup {
  position: relative; /* Parent container positioning */
  display: inline;
  vertical-align: top;
}

/* Basic styling for the profile popup */
.profile-popup {
  display: inline;
  position: fixed;
  align-items: center; /* Center horizontally */
  justify-content: center; /* Center vertically */
  text-align: center; /* Center text horizontally */
  top: 0; /* Adjust as needed */
  left: 0; /* Adjust as needed */
  right: 0; /* Adjust as needed */
  z-index: 1000;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
