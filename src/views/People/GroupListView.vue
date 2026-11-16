<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/Forms/Button.vue'
import Input from '@/components/Forms/Input.vue'
import Label from '@/components/Forms/Label.vue'
import Dialog from '@/components/Widgets/Dialog.vue'
import Paginator from '@/components/Paginator.vue'
import Toaster from '@/components/Widgets/Toaster.vue'

const axios = inject<AxiosInstance>('axios')
const router = useRouter()

const groups = ref<Record<string, any>[]>([])
const isLoading = ref(false)
const showError = ref(false)
const page = ref(1)
const perPage = ref(10)
const totalPages = ref(0)
const isOpen = ref(false)
const isCreating = ref(false)
const draft = reactive({
  name: '',
  description: '',
})

const loadGroups = (currentPage, itemsPerPage) => {
  isLoading.value = true
  axios
    .get('/groups', { params: { page: currentPage, page_size: itemsPerPage } })
    .then((response) => {
      groups.value = response.data.items
      page.value = response.data.page
      totalPages.value = Math.ceil(response.data.total / response.data.size)
      isLoading.value = false
    })
    .catch(() => {
      showError.value = true
      isLoading.value = false
    })
}

loadGroups(1, perPage.value)

const createGroup = () => {
  if (isCreating.value || !draft.name.trim()) return
  isCreating.value = true
  axios
    .post('/groups', {
      name: draft.name,
      description: draft.description || null,
      status: 'active',
    })
    .then((response) => {
      router.push({ name: 'group', params: { id: response.data.id } })
    })
    .catch(() => {
      showError.value = true
      isCreating.value = false
    })
}

</script>

<template>
  <Toaster message="Couldn't load groups. Please try again." type="error" :show="showError" @close="showError = false"></Toaster>
  <div class="app-page">
    <div class="app-page-header">
      <h1 class="grow min-w-0">Groups</h1>
      <Button @click="isOpen = true">Add group</Button>
    </div>
    <div class="app-page-section" v-if="!isLoading && groups.length === 0">
      <div class="app-empty-state">
        <div>
          <p class="font-medium text-gray-800">No groups yet</p>
          <p class="mt-1 text-sm text-gray-500">Create a small group, team, or ministry group.</p>
        </div>
      </div>
    </div>
    <div class="app-page-section" v-if="groups.length > 0">
      <div class="app-panel">
        <div class="app-table-wrap">
          <table class="app-data-table min-w-[40rem]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="group in groups" :key="group.id">
                <td>
                  <router-link class="font-medium no-underline" :to="{ name: 'group', params: { id: group.id } }">{{ group.name }}</router-link>
                  <p v-if="group.description" class="mt-0.5 max-w-md truncate text-xs text-gray-400">{{ group.description }}</p>
                </td>
                <td class="text-gray-600">{{ group.category?.name }}</td>
                <td>
                  <span class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-700">{{ group.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Paginator :page="page" :total-pages="totalPages" :items-per-page="perPage" :load-page="loadGroups" />
      </div>
    </div>
  </div>
  <Dialog :show="isOpen" title="Add group" :is-form="true" @close="isOpen = false" @submit="createGroup">
    <template #default>
      <div class="mb-4">
        <Label for-id="group_name">Name</Label>
        <Input class="w-full" id="group_name" type="text" v-model="draft.name"></Input>
      </div>
      <div class="mb-4">
        <Label for-id="group_description">Description</Label>
        <Input class="w-full" id="group_description" type="text" v-model="draft.description"></Input>
      </div>
    </template>
    <template #controls>
      <div class="flex items-center">
        <div class="grow">
          <Button stealth @click="isOpen = false">Cancel</Button>
        </div>
        <Button type="submit" :show-loader="isCreating">Create</Button>
      </div>
    </template>
  </Dialog>
</template>
