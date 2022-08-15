<script setup lang="ts">
import { useAuth } from '@websanova/vue-auth'

const auth = useAuth()
</script>

<template lang="pug">
#dashboard.ml-menu.py-main-tb
  .flex.items-center.px-main-lr.mb-10
    h1.grow Dashboard

  .px-main-lr Logged in: {{ auth.check() ? 'Yes' : 'No' }}
</template>
