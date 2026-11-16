<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, ref, watch } from 'vue'
import Button from '@/components/Forms/Button.vue'
import Dialog from '@/components/Widgets/Dialog.vue'

const props = defineProps<{
  show: boolean
  section: 'basic' | 'church' | 'address' | 'emergency'
  person: Record<string, any> | null
}>()

const emit = defineEmits<{ close: []; saved: [] }>()
const axios = inject<AxiosInstance>('axios')!

const saving = ref(false)
const error = ref('')
const categories = ref<{ id: number; name: string }[]>([])

const genders = ['male', 'female', 'unknown', 'other']
const maritalStatuses = ['single', 'married', 'divorced', 'remarried', 'widowed', 'separated']
const lifecycles = ['visitor', 'regular_attender', 'member', 'inactive', 'archived', 'deceased']
const memberships = ['none', 'adherent', 'member', 'former']
const phoneTypes = ['mobile', 'home', 'work', 'other']
const socialTypes = ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok']

const basic = ref(emptyBasic())
const church = ref(emptyChurch())
const address = ref(emptyAddress())
const contacts = ref<ContactRow[]>([])

interface ContactRow {
  name: string
  relationshipLabel: string
  phone: string
  email: string
}

function emptyBasic() {
  return {
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    gender: '',
    maritalStatus: '',
    dateOfBirth: '',
    marriageDate: '',
    emails: [] as { email: string; isPrimary: boolean }[],
    phones: [] as { number: string; phoneType: string; isPrimary: boolean }[],
    links: [] as { type: string; url: string }[],
  }
}

function emptyChurch() {
  return {
    lifecycleStatus: '',
    membershipStatus: '',
    memberSince: '',
    baptismStatus: '',
    baptismDate: '',
    baptismLocation: '',
    ministryInvolvement: '',
    categoryIds: [] as number[],
  }
}

function emptyAddress() {
  return {
    id: null as number | null,
    type: 'home',
    streetNumber: '',
    street: '',
    suburb: '',
    city: '',
    province: '',
    country: 'South Africa',
    postalCode: '',
  }
}

const dateInput = (value?: string | null) => (value ? String(value).slice(0, 10) : '')
const lower = (value?: string | null) => (value ? String(value).toLowerCase() : '')
const blank = (value: string) => value.trim() || null

const fill = () => {
  error.value = ''
  const person = props.person
  if (!person) return
  const emails = person.emails?.length
    ? person.emails.map((item: { email: string; isPrimary?: boolean }) => ({ email: item.email, isPrimary: Boolean(item.isPrimary) }))
    : person.email
      ? [{ email: person.email, isPrimary: true }]
      : [{ email: '', isPrimary: true }]
  const phones = person.phones?.length
    ? person.phones.map((item: { number: string; phoneType?: string; isPrimary?: boolean }) => ({
        number: item.number,
        phoneType: lower(item.phoneType) || 'mobile',
        isPrimary: Boolean(item.isPrimary),
      }))
    : person.mobileNumber
      ? [{ number: person.mobileNumber, phoneType: 'mobile', isPrimary: true }]
      : [{ number: '', phoneType: 'mobile', isPrimary: true }]
  basic.value = {
    title: person.title || '',
    firstName: person.firstName || '',
    middleName: person.middleName || '',
    lastName: person.lastName || '',
    preferredName: person.preferredName || '',
    gender: lower(person.gender),
    maritalStatus: lower(person.maritalStatus),
    dateOfBirth: dateInput(person.dateOfBirth),
    marriageDate: dateInput(person.marriageDate),
    emails,
    phones,
    links: (person.socialMediaLinks || []).map((link: { type?: string; url: string }) => ({
      type: lower(link.type) || 'facebook',
      url: link.url || '',
    })),
  }
  church.value = {
    lifecycleStatus: person.lifecycleStatus || '',
    membershipStatus: person.membershipStatus || '',
    memberSince: dateInput(person.memberSince),
    baptismStatus: person.baptismStatus || '',
    baptismDate: dateInput(person.baptismDate),
    baptismLocation: person.baptismLocation || '',
    ministryInvolvement: person.ministryInvolvement || '',
    categoryIds: (person.categories || []).map((category: { id: number }) => category.id),
  }
  const current = person.addresses?.[0]
  address.value = current
    ? {
        id: current.id,
        type: current.type || 'home',
        streetNumber: current.streetNumber || '',
        street: current.street || '',
        suburb: current.suburb || '',
        city: current.city || '',
        province: current.province || '',
        country: current.country || 'South Africa',
        postalCode: current.postalCode || '',
      }
    : emptyAddress()
  contacts.value = (person.emergencyContacts || []).map((contact: ContactRow) => ({
    name: contact.name || '',
    relationshipLabel: contact.relationshipLabel || '',
    phone: contact.phone || '',
    email: contact.email || '',
  }))
}

watch(() => props.show, (open) => {
  if (!open) return
  fill()
  if (props.section === 'church' && categories.value.length === 0) {
    axios.get('/people/categories').then((response) => {
      categories.value = response.data || []
    }).catch(() => {
      categories.value = []
    })
  }
})

const titleFor = {
  basic: 'Edit basic information',
  church: 'Edit church life',
  address: 'Edit address',
  emergency: 'Edit emergency contacts',
}

const ensureUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : `https://${value}`)

const messageOf = (err: unknown) => {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => (typeof item === 'string' ? item : item?.msg)).filter(Boolean).join(' ')
  }
  return "Couldn't save these changes."
}

const patchPerson = async (body: Record<string, unknown>) => {
  await axios.patch(`/people/${props.person!.id}`, { id: props.person!.id, ...body })
}

const save = async () => {
  if (!props.person) return
  saving.value = true
  error.value = ''
  try {
    if (props.section === 'basic') {
      if (!basic.value.firstName.trim() || !basic.value.lastName.trim()) {
        error.value = 'First and last name are required.'
        return
      }
      const emails = basic.value.emails.filter((item) => item.email.trim())
      if (emails.length && !emails.some((item) => item.isPrimary)) emails[0].isPrimary = true
      const phones = basic.value.phones.filter((item) => item.number.trim())
      if (phones.length && !phones.some((item) => item.isPrimary)) phones[0].isPrimary = true
      await patchPerson({
        title: blank(basic.value.title),
        firstName: basic.value.firstName.trim(),
        middleName: blank(basic.value.middleName),
        lastName: basic.value.lastName.trim(),
        preferredName: blank(basic.value.preferredName),
        gender: basic.value.gender || null,
        maritalStatus: basic.value.maritalStatus || null,
        dateOfBirth: basic.value.dateOfBirth || null,
        marriageDate: basic.value.marriageDate || null,
        emails,
        phones,
        socialMediaLinks: basic.value.links
          .filter((link) => link.url.trim())
          .map((link) => ({ type: link.type, url: ensureUrl(link.url.trim()) })),
      })
    } else if (props.section === 'church') {
      await patchPerson({
        lifecycleStatus: church.value.lifecycleStatus || null,
        membershipStatus: church.value.membershipStatus || null,
        memberSince: church.value.memberSince || null,
        baptismStatus: blank(church.value.baptismStatus),
        baptismDate: church.value.baptismDate || null,
        baptismLocation: blank(church.value.baptismLocation),
        ministryInvolvement: blank(church.value.ministryInvolvement),
        categoryIds: church.value.categoryIds,
      })
    } else if (props.section === 'address') {
      const draft = address.value
      if (!draft.streetNumber || !draft.street || !draft.suburb || !draft.city || !draft.province || !draft.country) {
        error.value = 'Street number, street, suburb, city, province and country are required.'
        return
      }
      if (draft.id) {
        await axios.put(`/addresses/?id=${draft.id}`, draft)
      } else {
        const created = await axios.post('/addresses', draft)
        await patchPerson({ addresses: [created.data.id] })
      }
    } else if (props.section === 'emergency') {
      await patchPerson({
        emergencyContacts: contacts.value
          .filter((contact) => contact.name.trim())
          .map((contact) => ({
            name: contact.name.trim(),
            relationshipLabel: blank(contact.relationshipLabel),
            phone: blank(contact.phone),
            email: blank(contact.email),
          })),
      })
    }
    emit('saved')
  } catch (err) {
    error.value = messageOf(err)
  } finally {
    saving.value = false
  }
}

const labelize = (value: string) => value.replaceAll('_', ' ')
</script>

<template>
  <Dialog :show="show" :title="titleFor[section]" :is-form="true" size="lg" @close="emit('close')" @submit="save">
    <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
    <div v-if="section === 'basic'" class="grid gap-3 sm:grid-cols-2">
      <label class="block text-sm"><span class="app-label">Title</span><input v-model="basic.title" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Preferred name</span><input v-model="basic.preferredName" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">First name</span><input v-model="basic.firstName" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Middle name</span><input v-model="basic.middleName" class="app-field" /></label>
      <label class="block text-sm sm:col-span-2"><span class="app-label">Last name</span><input v-model="basic.lastName" class="app-field" /></label>
      <label class="block text-sm">
        <span class="app-label">Gender</span>
        <select v-model="basic.gender" class="app-field">
          <option value="">Not set</option>
          <option v-for="option in genders" :key="option" :value="option">{{ labelize(option) }}</option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="app-label">Marital status</span>
        <select v-model="basic.maritalStatus" class="app-field">
          <option value="">Not set</option>
          <option v-for="option in maritalStatuses" :key="option" :value="option">{{ labelize(option) }}</option>
        </select>
      </label>
      <label class="block text-sm"><span class="app-label">Date of birth</span><input v-model="basic.dateOfBirth" type="date" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Marriage date</span><input v-model="basic.marriageDate" type="date" class="app-field" /></label>
      <div class="sm:col-span-2 space-y-2">
        <p class="app-label">Email addresses</p>
        <div v-for="(item, index) in basic.emails" :key="index" class="flex gap-2">
          <input v-model="item.email" type="email" class="app-field" placeholder="Email" />
          <label class="inline-flex items-center gap-1 text-xs text-gray-500"><input v-model="item.isPrimary" type="checkbox" /> Primary</label>
          <button type="button" class="text-sm text-gray-400" @click="basic.emails.splice(index, 1)">Remove</button>
        </div>
        <button type="button" class="app-link-btn" @click="basic.emails.push({ email: '', isPrimary: basic.emails.length === 0 })">Add email</button>
      </div>
      <div class="sm:col-span-2 space-y-2">
        <p class="app-label">Phone numbers</p>
        <div v-for="(item, index) in basic.phones" :key="index" class="flex gap-2">
          <input v-model="item.number" class="app-field" placeholder="Number" />
          <select v-model="item.phoneType" class="app-field max-w-32">
            <option v-for="option in phoneTypes" :key="option" :value="option">{{ labelize(option) }}</option>
          </select>
          <label class="inline-flex items-center gap-1 text-xs text-gray-500"><input v-model="item.isPrimary" type="checkbox" /> Primary</label>
          <button type="button" class="text-sm text-gray-400" @click="basic.phones.splice(index, 1)">Remove</button>
        </div>
        <button type="button" class="app-link-btn" @click="basic.phones.push({ number: '', phoneType: 'mobile', isPrimary: basic.phones.length === 0 })">Add phone</button>
      </div>
      <div class="sm:col-span-2 space-y-2">
        <p class="app-label">Social profiles</p>
        <div v-for="(item, index) in basic.links" :key="index" class="flex gap-2">
          <select v-model="item.type" class="app-field max-w-36">
            <option v-for="option in socialTypes" :key="option" :value="option">{{ labelize(option) }}</option>
          </select>
          <input v-model="item.url" class="app-field" placeholder="https://" />
          <button type="button" class="text-sm text-gray-400" @click="basic.links.splice(index, 1)">Remove</button>
        </div>
        <button type="button" class="app-link-btn" @click="basic.links.push({ type: 'facebook', url: '' })">Add profile</button>
      </div>
    </div>
    <div v-else-if="section === 'church'" class="grid gap-3 sm:grid-cols-2">
      <label class="block text-sm">
        <span class="app-label">Lifecycle</span>
        <select v-model="church.lifecycleStatus" class="app-field">
          <option value="">Not set</option>
          <option v-for="option in lifecycles" :key="option" :value="option">{{ labelize(option) }}</option>
          <option v-if="church.lifecycleStatus && !lifecycles.includes(church.lifecycleStatus)" :value="church.lifecycleStatus">{{ church.lifecycleStatus }}</option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="app-label">Membership</span>
        <select v-model="church.membershipStatus" class="app-field">
          <option value="">Not set</option>
          <option v-for="option in memberships" :key="option" :value="option">{{ labelize(option) }}</option>
        </select>
      </label>
      <label class="block text-sm"><span class="app-label">Member since</span><input v-model="church.memberSince" type="date" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Baptism</span><input v-model="church.baptismStatus" class="app-field" placeholder="Baptised" /></label>
      <label class="block text-sm"><span class="app-label">Baptism date</span><input v-model="church.baptismDate" type="date" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Baptism location</span><input v-model="church.baptismLocation" class="app-field" /></label>
      <label class="block text-sm sm:col-span-2"><span class="app-label">Ministry</span><input v-model="church.ministryInvolvement" class="app-field" /></label>
      <div class="sm:col-span-2">
        <p class="app-label">Categories</p>
        <p v-if="categories.length === 0" class="text-sm text-gray-400">No categories yet.</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <label v-for="category in categories" :key="category.id" class="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-sm">
            <input v-model="church.categoryIds" type="checkbox" :value="category.id" />
            {{ category.name }}
          </label>
        </div>
      </div>
    </div>
    <div v-else-if="section === 'address'" class="grid gap-3 sm:grid-cols-2">
      <p v-if="!address.id && person?.households?.[0]?.address" class="sm:col-span-2 text-sm text-gray-500">This person currently uses a household address. Saving here gives them their own address.</p>
      <label class="block text-sm"><span class="app-label">Street number</span><input v-model="address.streetNumber" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Street</span><input v-model="address.street" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Suburb</span><input v-model="address.suburb" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">City</span><input v-model="address.city" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Province</span><input v-model="address.province" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Country</span><input v-model="address.country" class="app-field" /></label>
      <label class="block text-sm"><span class="app-label">Postal code</span><input v-model="address.postalCode" class="app-field" /></label>
    </div>
    <div v-else-if="section === 'emergency'" class="space-y-3">
      <div v-for="(contact, index) in contacts" :key="index" class="grid gap-2 rounded-md border border-gray-100 p-3 sm:grid-cols-2">
        <input v-model="contact.name" class="app-field" placeholder="Name" />
        <input v-model="contact.relationshipLabel" class="app-field" placeholder="Relationship" />
        <input v-model="contact.phone" class="app-field" placeholder="Phone" />
        <input v-model="contact.email" class="app-field" placeholder="Email" />
        <button type="button" class="text-left text-sm text-gray-400 sm:col-span-2" @click="contacts.splice(index, 1)">Remove</button>
      </div>
      <button type="button" class="app-link-btn" @click="contacts.push({ name: '', relationshipLabel: '', phone: '', email: '' })">Add contact</button>
    </div>
    <template #controls>
      <div class="flex items-center">
        <div class="grow"><Button stealth @click="emit('close')">Cancel</Button></div>
        <Button type="submit" :show-loader="saving">Save</Button>
      </div>
    </template>
  </Dialog>
</template>
