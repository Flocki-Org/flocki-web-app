<script setup lang="ts">
import { ref, watch } from 'vue'
import { isAppImage, peekCachedImage, rememberImage } from '@/imageCache'

const props = defineProps<{ src: string; alt?: string }>()
const emit = defineEmits<{ error: [] }>()
const shown = ref('')
const failed = ref(false)

watch(() => props.src, async (url) => {
  failed.value = false
  if (!url) {
    shown.value = ''
    return
  }
  const ready = peekCachedImage(url)
  if (ready) {
    shown.value = ready
    return
  }
  if (!isAppImage(url)) {
    shown.value = url
    return
  }
  shown.value = ''
  shown.value = await rememberImage(url)
}, { immediate: true })

const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const onError = () => {
  if (failed.value) return
  failed.value = true
  shown.value = ''
  emit('error')
}
</script>

<template>
  <img
    :src="shown || blank"
    :alt="alt || ''"
    :class="{ invisible: !shown || failed }"
    @error="onError"
  >
</template>
