<script setup lang="ts">
import { useAuth } from '@websanova/vue-auth'

const auth = useAuth()
</script>

<template>
  <div class="app-page" id="dashboard">
    <div class="app-page-header">
      <div class="grow min-w-0">
        <h1>Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">Overview of your church community.</p>
      </div>
    </div>
    <div class="app-page-section">
      <div class="app-panel p-5 sm:p-6">
        <p class="text-sm font-medium text-gray-900">Welcome back</p>
        <p class="mt-1 text-sm leading-relaxed text-gray-500">
          Use People to manage members and households. More dashboard widgets will appear here as modules come online.
        </p>
        <p class="mt-4 text-xs text-gray-400">
          Signed in: {{ auth.check() ? 'Yes' : 'No' }}
        </p>
      </div>
    </div>
  </div>
</template>
