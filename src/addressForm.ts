import type { AddressDraft } from '@/components/AddressEntry.vue'

export function emptyAddress(country = 'South Africa'): AddressDraft {
  return {
    id: null,
    type: 'home',
    streetNumber: '',
    street: '',
    suburb: '',
    city: '',
    province: '',
    country,
    postalCode: '',
    building: '',
    unit: '',
    latitude: null,
    longitude: null,
  }
}

export function addressProblem(address: AddressDraft): string {
  const place = [address.street, address.suburb, address.city].some((value) => value?.trim())
  if (!place || !address.country?.trim()) {
    return 'Choose an address, or enter a street, suburb, or city, and a country.'
  }
  return ''
}
