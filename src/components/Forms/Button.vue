<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (val) => ['submit', 'reset', 'button'].includes(val),
  },
});
</script>

<template lang="pug">
button.inline-flex.items-center.text-white.bg-sky-500.hover_bg-sky-400.font-medium.rounded-lg.px-5.py-2.cursor-pointer.transition-all(
  :type="type"
)
  slot
</template>