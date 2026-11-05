<script setup lang="ts">
import { useAuth } from '@websanova/vue-auth'

const auth = useAuth()
</script>

<template>
  <div class="app-page" id="dashboard">
    <div class="app-page-header">
      <h1 class="grow min-w-0">Dashboard</h1>
    </div>
    <div class="app-page-section">Logged in: {{ auth.check() ? 'Yes' : 'No' }}</div>
  </div>
</template>
