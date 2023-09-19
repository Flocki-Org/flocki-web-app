<script setup lang="ts">
import { useAuth } from '@websanova/vue-auth'

const auth = useAuth()
</script>

<template>
  <div class="ml-menu py-main-tb" id="dashboard">
    <div class="flex items-center px-main-lr mb-10">
      <h1 class="grow">Dashboard</h1>
    </div>
    <div class="px-main-lr">Logged in: {{ auth.check() ? 'Yes' : 'No' }}</div>
  </div>
</template>
