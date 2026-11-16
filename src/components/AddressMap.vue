<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  address: { type: Object, default: null },
})

const mapEl = ref(null)
const status = ref('idle')
const precision = ref('')
const point = ref(null)
let map = null
let requestId = 0

const signature = computed(() => {
  const address = props.address
  if (!address) return ''
  return [
    address.latitude,
    address.longitude,
    address.streetNumber,
    address.street,
    address.suburb,
    address.city,
    address.province,
    address.postalCode,
    address.country,
  ].join('|')
})

const osmUrl = computed(() => {
  if (!point.value) return ''
  const { lat, lng, zoom } = point.value
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`
})

const locationNote = computed(() => {
  if (precision.value === 'street') return 'Showing the street. This house number is not on the map.'
  if (precision.value === 'area') return 'Showing the area around this address.'
  return ''
})

const destroyMap = () => {
  if (map) {
    map.remove()
    map = null
  }
}

const expandStreet = (value) => {
  if (!value) return ''
  const suffixes = [
    [/\brd\b/gi, 'Road'],
    [/\bst\b/gi, 'Street'],
    [/\bave\b/gi, 'Avenue'],
    [/\bdr\b/gi, 'Drive'],
    [/\bcres\b/gi, 'Crescent'],
    [/\bblvd\b/gi, 'Boulevard'],
    [/\bln\b/gi, 'Lane'],
    [/\bhwy\b/gi, 'Highway'],
    [/\bpl\b/gi, 'Place'],
  ]
  return suffixes.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value.trim())
}

const placesOf = (address) => {
  const parts = String(address.suburb || '')
    .split(',')
    .map((part) => part.replace(/\s+AH\b/gi, '').trim())
    .filter(Boolean)
  return {
    neighbourhood: parts[0] || '',
    town: parts.length > 1 ? parts[parts.length - 1] : '',
    metro: address.city || '',
  }
}

const streetCore = (street) =>
  expandStreet(street)
    .toLowerCase()
    .replace(/\b(road|street|avenue|drive|crescent|boulevard|lane|highway|place)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const search = async (params) => {
  const query = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', limit: '5' })
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) return []
  const rows = await response.json()
  return Array.isArray(rows) ? rows : []
}

const chooseStreet = (rows, address) => {
  const core = streetCore(address.street)
  if (!core) return null
  const named = rows.filter((row) => (row.display_name || '').toLowerCase().includes(core))
  if (!named.length) return null
  const postal = String(address.postalCode || '')
  const postalMatch = postal
    ? named.find((row) => String(row.address?.postcode || '').startsWith(postal) || (row.display_name || '').includes(postal))
    : null
  const chosen = postalMatch || named[0]
  const houseNumber = String(address.streetNumber || '')
  const exactHouse = houseNumber && String(chosen.address?.house_number || '') === houseNumber
  return {
    lat: Number(chosen.lat),
    lng: Number(chosen.lon),
    zoom: exactHouse ? 18 : 17,
    precision: exactHouse ? 'house' : 'street',
  }
}

const geocode = async (address) => {
  if (address.latitude != null && address.longitude != null && address.latitude !== '' && address.longitude !== '') {
    return { lat: Number(address.latitude), lng: Number(address.longitude), zoom: 17, precision: 'house' }
  }

  const { neighbourhood, town, metro } = placesOf(address)
  const locality = town || metro
  const country = address.country || ''
  const countrycodes = country.trim().toLowerCase() === 'south africa' ? 'za' : ''
  const street = expandStreet([address.streetNumber, address.street].filter(Boolean).join(' '))

  if (address.street) {
    const structured = await search({
      street,
      city: locality,
      postalcode: address.postalCode || '',
      country,
      countrycodes,
    })
    const structuredHit = chooseStreet(structured, address)
    if (structuredHit) return structuredHit

    const freeText = [street, locality, address.postalCode, country].filter(Boolean).join(', ')
    const freeHit = chooseStreet(await search({ q: freeText, countrycodes }), address)
    if (freeHit) return freeHit
  }

  const area = [neighbourhood, town || (!address.street ? metro : ''), address.province, country].filter(Boolean).join(', ')
  if (!area) return null
  const rows = await search({ q: area, countrycodes })
  const row = rows[0]
  if (!row) return null
  return { lat: Number(row.lat), lng: Number(row.lon), zoom: 14, precision: 'area' }
}

const draw = async (located) => {
  status.value = 'ready'
  point.value = located
  precision.value = located.precision
  await nextTick()
  if (!mapEl.value) return
  destroyMap()
  map = L.map(mapEl.value, { scrollWheelZoom: false, attributionControl: true }).setView(
    [located.lat, located.lng],
    located.zoom,
  )
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map)
  L.circleMarker([located.lat, located.lng], {
    radius: 8,
    color: '#0369a1',
    fillColor: '#0ea5e9',
    fillOpacity: 0.95,
    weight: 2,
  }).addTo(map)
  window.setTimeout(() => map && map.invalidateSize(), 150)
}

const render = async () => {
  const current = ++requestId
  destroyMap()
  point.value = null
  precision.value = ''
  if (!props.address) {
    status.value = 'missing'
    return
  }
  status.value = 'loading'
  try {
    const located = await geocode(props.address)
    if (current !== requestId) return
    if (!located) {
      status.value = 'missing'
      return
    }
    await draw(located)
  } catch {
    if (current === requestId) status.value = 'missing'
  }
}

watch(signature, render, { immediate: true })
onBeforeUnmount(() => {
  requestId += 1
  destroyMap()
})
</script>

<template>
  <div class="address-map mt-3">
    <p v-if="status === 'loading'" class="text-sm text-gray-400">Finding this address on the map…</p>
    <p v-else-if="status === 'missing'" class="text-sm text-gray-400">No map location for this address yet.</p>
    <template v-else>
      <div ref="mapEl" class="address-map-canvas"></div>
      <p v-if="locationNote" class="mt-2 text-xs text-gray-400">{{ locationNote }}</p>
      <a class="mt-2 inline-block text-sm text-sky-600 hover:text-sky-700" :href="osmUrl" target="_blank" rel="noopener noreferrer">Open in OpenStreetMap</a>
    </template>
  </div>
</template>

<style>
.address-map-canvas {
  height: 14rem;
  width: 100%;
  overflow: hidden;
  border-radius: 0.75rem;
  z-index: 0;
}
.address-map-canvas .leaflet-container {
  height: 100%;
  width: 100%;
  z-index: 0;
  font: inherit;
}
</style>
