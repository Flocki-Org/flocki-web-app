<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import MainSidebar from '@/views/Layout/MainSidebar.vue'
import MainTopbar from '@/views/Layout/MainTopbar.vue'
import { provideSidebar } from '@/composables/useSidebar'

const route = useRoute()
const sidebar = provideSidebar()

const closeOnDesktop = () => {
  if (window.matchMedia('(min-width: 1024px)').matches) {
    sidebar.close()
  }
}

watch(
  () => route.fullPath,
  () => {
    sidebar.close()
  },
)

onMounted(() => {
  window.addEventListener('resize', closeOnDesktop)
})

onUnmounted(() => {
  window.removeEventListener('resize', closeOnDesktop)
})
</script>

<template>
  <div class="min-h-full">
    <MainSidebar />
    <MainTopbar />
    <RouterView />
  </div>
</template>
