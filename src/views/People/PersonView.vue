<script setup lang="ts">

import type { AxiosInstance } from 'axios'
import { ref, inject, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useRepo } from 'pinia-orm'
import Toaster from '@/components/Widgets/Toaster.vue'
import Person from '@/models/Person'
import ImageCropperUploader from '../../components/ImageCropperUploader.vue';
import { getPersonImageUrl, getHouseholdImageUrl } from '@/imageUtils';
import AddressDisplay from '../../components/AddressDisplay.vue';
import AddressMap from '@/components/AddressMap.vue';
import UserProfilePopup from '../../components/people/UserProfilePopup.vue';
import PersonEditor from '@/components/people/PersonEditor.vue'
import PersonSearch, { type PersonHit } from '@/components/people/PersonSearch.vue'
import Button from '@/components/Forms/Button.vue'
import Dialog from '@/components/Widgets/Dialog.vue'


const axios = inject<AxiosInstance>('axios')

const route = useRoute()
const router = useRouter()

const isLoadingPerson = ref(true)
const showLoadingError = ref(false)
const person = ref<Person | null>(null)
const ministryLinks = ref<{ departmentId: number; name: string; roleName: string }[]>([])
const groupAdminLinks = ref<{ groupId: number; groupName: string; roleName: string }[]>([])

const hovered = ref(false);
const dropdownVisible = ref(false);
const profileImageFailed = ref(false)
const profileImageViewVisible = ref(false)
const uploadProfileImage = ref(false)
const croppedImage = ref<string | null>(null);
const uploadProfileImageFailed = ref(false);
const uploadProfileImageSuccess = ref(false);
const editSection = ref<'basic' | 'church' | 'address' | 'emergency' | null>(null)
const menuOpen = ref(false)
const savedNotice = ref(false)
const actionError = ref('')
const addingMember = ref(false)
const savingMember = ref(false)
const memberError = ref('')
const pickedMember = ref<PersonHit | null>(null)
const householdAddress = ref({
  streetNumber: '',
  street: '',
  suburb: '',
  city: '',
  province: '',
  country: 'South Africa',
  postalCode: '',
})

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

const onProfileImageError = (event) => {
  const failedId = Number(event.currentTarget?.dataset?.imageId)
  if (person.value?.profileImage?.id === failedId) {
    profileImageFailed.value = true
  }
}

watch(() => person.value?.profileImage?.id, () => {
  profileImageFailed.value = false
})

const loadPerson = (id) => {
  isLoadingPerson.value = true
  Promise.all([
    axios.get('/people/' + id),
    axios.get(`/people/${id}/groups`).catch(() => ({ data: [] })),
    axios.get(`/people/${id}/relationships`).catch(() => ({ data: [] })),
    axios.get(`/people/${id}/ministries`).catch(() => ({ data: { ministries: [], groupAdministrations: [] } })),
  ])
      .then(([personResponse, groupsResponse, relationshipsResponse, ministriesResponse]) => {
        ministryLinks.value = ministriesResponse.data?.ministries || []
        groupAdminLinks.value = ministriesResponse.data?.groupAdministrations || []
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

const onSaved = () => {
  editSection.value = null
  savedNotice.value = true
  setTimeout(() => {
    savedNotice.value = false
  }, 3000)
  if (person.value) loadPerson(person.value.id)
}

const archivePerson = async () => {
  if (!person.value) return
  menuOpen.value = false
  try {
    await axios.post(`/people/${person.value.id}/archive`)
    loadPerson(person.value.id)
  } catch {
    actionError.value = "Couldn't archive this person."
  }
}

const restorePerson = async () => {
  if (!person.value) return
  menuOpen.value = false
  try {
    await axios.post(`/people/${person.value.id}/restore`)
    loadPerson(person.value.id)
  } catch {
    actionError.value = "Couldn't restore this person."
  }
}

const householdOf = () => person.value?.households?.[0] ?? null

const openAddMember = () => {
  pickedMember.value = null
  memberError.value = ''
  householdAddress.value = {
    streetNumber: '',
    street: '',
    suburb: '',
    city: '',
    province: '',
    country: 'South Africa',
    postalCode: '',
  }
  addingMember.value = true
}

const messageOf = (err: unknown, fallback: string) => {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item?.msg || item).filter(Boolean).join(' ')
  return fallback
}

const addHouseholdMember = async () => {
  if (!person.value || !pickedMember.value) {
    memberError.value = 'Choose a person.'
    return
  }
  savingMember.value = true
  memberError.value = ''
  try {
    const household = householdOf()
    const existing = await axios.get(`/people/${pickedMember.value.id}`)
    const otherHousehold = (existing.data.households || [])[0]
    if (otherHousehold && otherHousehold.id !== household?.id) {
      memberError.value = `${pickedMember.value.firstName} already belongs to ${otherHousehold.name || 'another household'}.`
      return
    }
    if (household) {
      await axios.post(`/households/${household.id}/members`, {}, { params: { person_id: pickedMember.value.id } })
    } else {
      let addressId = person.value.addresses?.[0]?.id
      if (!addressId) {
        const draft = householdAddress.value
        if (!draft.streetNumber || !draft.street || !draft.suburb || !draft.city || !draft.province || !draft.country) {
          memberError.value = 'A household needs an address. Street number, street, suburb, city, province and country are required.'
          return
        }
        const created = await axios.post('/addresses', { ...draft, type: 'home' })
        addressId = created.data.id
      }
      await axios.post('/households', {
        name: `${person.value.lastName} household`,
        leaderId: person.value.id,
        peopleIds: [person.value.id, pickedMember.value.id],
        addressId,
      })
    }
    addingMember.value = false
    savedNotice.value = true
    setTimeout(() => {
      savedNotice.value = false
    }, 3000)
    loadPerson(person.value.id)
  } catch (err) {
    memberError.value = messageOf(err, "Couldn't add that person to the household.")
  } finally {
    savingMember.value = false
  }
}

const removeHouseholdMember = async (memberId: number, name: string) => {
  const household = householdOf()
  if (!person.value || !household) return
  if (household.leader?.id === memberId) {
    actionError.value = 'Choose another household leader before removing this person.'
    return
  }
  if (!confirm(`Remove ${name} from this household?`)) return
  try {
    await axios.delete(`/households/${household.id}/members/${memberId}`)
    loadPerson(person.value.id)
  } catch (err) {
    actionError.value = messageOf(err, "Couldn't remove that person from the household.")
  }
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
  <Toaster message="Saved." type="success" :show="savedNotice" @close="savedNotice = false"></Toaster>
  <Toaster :message="actionError" type="error" :show="Boolean(actionError)" @close="actionError = ''"></Toaster>
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
      <div class="relative shrink-0">
        <button type="button" class="w-10 h-8 inline-flex justify-center items-center rounded-md border border-sky-400 hover:border-sky-300 text-sky-400 bg-transparent hover:bg-sky-50 transition-all" aria-label="Person actions" @click="menuOpen = !menuOpen">
          <svg style="width:16px;height:16px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"></path>
          </svg>
        </button>
        <ul v-if="menuOpen" class="absolute right-0 z-10 mt-1 w-44 rounded-md border border-gray-100 bg-white py-1 text-sm shadow-lg">
          <li><button type="button" class="block w-full px-3 py-2 text-left hover:bg-gray-50" @click="menuOpen = false; editSection = 'basic'">Edit details</button></li>
          <li v-if="person?.lifecycleStatus === 'archived'"><button type="button" class="block w-full px-3 py-2 text-left hover:bg-gray-50" @click="restorePerson">Restore person</button></li>
          <li v-else><button type="button" class="block w-full px-3 py-2 text-left text-red-600 hover:bg-gray-50" @click="archivePerson">Archive person</button></li>
        </ul>
      </div>
    </div>
    <div class="app-detail-grid">
      <div class="app-detail-primary order-2 lg:order-1">
        <div class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center app-panel-pad py-6 sm:py-8">
            <h2 class="grow text-gray-700">Basic Information</h2>
            <button type="button" class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover:border-gray-200 text-gray-400 bg-transparent hover:bg-gray-50 transition-all" aria-label="Edit basic information" @click="editSection = 'basic'">
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
            <button type="button" class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover:border-gray-200 text-gray-400 bg-transparent hover:bg-gray-50 transition-all" aria-label="Edit church life" @click="editSection = 'church'">
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
                <td class="py-4 pr-4 break-words">
                  <ul v-if="ministryLinks.length" class="space-y-1">
                    <li v-for="ministry in ministryLinks" :key="ministry.departmentId">
                      <router-link :to="{ name: 'ministry', params: { id: ministry.departmentId } }">{{ ministry.name }}</router-link>
                      <span class="text-gray-400"> · {{ ministry.roleName }}</span>
                    </li>
                  </ul>
                  <ul v-if="groupAdminLinks.length" class="mt-1 space-y-1">
                    <li v-for="admin in groupAdminLinks" :key="admin.groupId">
                      <router-link :to="{ name: 'group', params: { id: admin.groupId } }">{{ admin.groupName }}</router-link>
                      <span class="text-gray-400"> · {{ admin.roleName }}</span>
                    </li>
                  </ul>
                  <p v-if="person?.ministryInvolvement" :class="{ 'mt-1': ministryLinks.length || groupAdminLinks.length }">{{ person.ministryInvolvement }}</p>
                  <template v-if="!ministryLinks.length && !groupAdminLinks.length && !person?.ministryInvolvement">—</template>
                </td>
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
            <button type="button" class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover:border-gray-200 text-gray-400 bg-transparent hover:bg-gray-50 transition-all" aria-label="Edit address" @click="editSection = 'address'">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <div class="address app-panel-pad mb-6 text-sm text-gray-600" v-if="person && person.addresses && person.addresses[0]">
            <AddressDisplay :address="person.addresses[0]" addressFormat="[[streetNumber]] [[street]] [[newline]] [[suburb]], [[city]], [[postalCode]]" />
            <AddressMap :address="person.addresses[0]" />
          </div>
          <div class="address app-panel-pad mb-6 text-sm text-gray-600" v-else-if="person && person.households && person.households[0] && person.households[0].address">
            <AddressDisplay :address="person.households[0].address" addressFormat="[[streetNumber]] [[street]] [[newline]] [[suburb]], [[city]], [[postalCode]]" />
            <AddressMap :address="person.households[0].address" />
          </div>
          <div v-else class="app-panel-pad mb-4 text-gray-500 text-sm">No address</div>

        </div>
        <div v-if="person" class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div class="flex items-center app-panel-pad py-6 sm:py-8">
            <h2 class="grow text-gray-700">Emergency contacts</h2>
            <button type="button" class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover:border-gray-200 text-gray-400 bg-transparent hover:bg-gray-50 transition-all" aria-label="Edit emergency contacts" @click="editSection = 'emergency'">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <p v-if="!person.emergencyContacts?.length" class="app-panel-pad pb-6 text-sm text-gray-400">No emergency contacts yet.</p>
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
                 :key="person.profileImage.id"
                 :data-image-id="person.profileImage.id"
                 :src="getPersonImageUrl(person)"
                 @error="onProfileImageError">
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
        <div v-if="person" class="rounded-lg bg-white relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div class="flex items-center gap-2 app-panel-pad py-6 sm:py-8">
            <router-link v-if="person.households?.[0]" class="grow" :to="{name: 'household', params: {id: person.households[0].id} }">
              <h2 class="text-gray-700">{{ person.households[0].name || (person.lastName + ' Household') }}</h2>
            </router-link>
            <h2 v-else class="grow text-gray-700">Household</h2>
            <button type="button" class="app-link-btn" @click="openAddMember">Add family member</button>
            <button v-if="person.households?.[0]" type="button" class="w-8 h-8 inline-flex justify-center items-center rounded-md border border-gray-300 hover:border-gray-200 text-gray-400 bg-transparent hover:bg-gray-50 transition-all" aria-label="Edit household" @click="router.push({ name: 'household', params: { id: person.households[0].id } })">
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
              </svg>
            </button>
          </div>
          <p v-if="!person.households?.[0]" class="app-panel-pad pb-6 text-sm text-gray-500">This person is not in a household yet. Adding a family member starts one, with this person as the leader.</p>
          <img v-if="person.households?.[0]" class="w-full" :src="getHouseholdImageUrl(person.households[0])">
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
                          <div class="inline-flex items-center" title="Household leader">
                            <router-link  class="mr-2" :to="{name: 'person', params: {id: householdPerson.id} }">{{ householdPerson.firstName + " " + householdPerson.lastName }}</router-link>
                            <svg v-if="householdPerson.id == person.households[0].leader.id" class="text-sky-500" style="width:16px;height:16px" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path>
                            </svg>
                            <button v-else type="button" class="text-xs text-gray-400 hover:text-red-600" @click="removeHouseholdMember(householdPerson.id, householdPerson.firstName + ' ' + householdPerson.lastName)">Remove</button>
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
  <PersonEditor :show="editSection !== null" :section="editSection || 'basic'" :person="person" @close="editSection = null" @saved="onSaved" />
  <Dialog :show="addingMember" title="Add a family member" :is-form="true" @close="addingMember = false" @submit="addHouseholdMember">
    <p v-if="memberError" class="mb-3 text-sm text-red-600">{{ memberError }}</p>
    <p class="mb-3 text-sm text-gray-500">They join this person's household. The household keeps one address and one leader.</p>
    <PersonSearch :exclude-ids="[person?.id, ...(person?.households?.[0]?.people || []).map((member) => member.id)].filter(Boolean)" @select="pickedMember = $event" />
    <p v-if="pickedMember" class="mt-3 text-sm text-gray-800">{{ pickedMember.firstName }} {{ pickedMember.lastName }}</p>
    <div v-if="!person?.households?.[0] && !person?.addresses?.[0]?.id" class="mt-4 grid gap-3 sm:grid-cols-2">
      <p class="sm:col-span-2 text-sm text-gray-500">A new household needs an address.</p>
      <label class="block text-sm"><span class="app-label">Street number</span><input v-model="householdAddress.streetNumber" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Street</span><input v-model="householdAddress.street" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Suburb</span><input v-model="householdAddress.suburb" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">City</span><input v-model="householdAddress.city" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Province</span><input v-model="householdAddress.province" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Country</span><input v-model="householdAddress.country" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Postal code</span><input v-model="householdAddress.postalCode" class="app-field" /></label>
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="addingMember = false">Cancel</Button></div>
        <Button type="submit" :show-loader="savingMember">Add to household</Button>
      </div>
    </template>
  </Dialog>
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
