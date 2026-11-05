<script setup lang="ts">
defineProps({
  forId: {
    type: String
  },
});
</script>

<template lang="pug">
label.block.text-sm.font-medium.text-gray-700(
  class="mb-1.5"
  :for="forId"
)
  slot
</template>
