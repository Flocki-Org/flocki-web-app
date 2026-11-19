<script setup lang="ts">
import { computed } from 'vue'
import CachedImage from '@/components/CachedImage.vue'
import { getPersonImageUrl } from '@/imageUtils'
import defaultAvatar from '@/assets/default-user-profile.png'

const props = withDefaults(defineProps<{
  person?: { profileImage?: { id?: number | string | null } | null; externalImageUrl?: string | null } | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>(), { size: 'sm' })

const emit = defineEmits<{ error: [] }>()

const src = computed(() => getPersonImageUrl(props.person))
const box = computed(() => ({
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}[props.size]))
</script>

<template>
  <span class="relative inline-flex shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200" :class="box">
    <img class="h-full w-full object-cover" :src="defaultAvatar" alt="">
    <CachedImage
      v-if="src"
      class="absolute inset-0 h-full w-full object-cover"
      :src="src"
      alt=""
      @error="emit('error')"
    />
  </span>
</template>
