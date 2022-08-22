<script setup lang="ts">
const props = defineProps({
  forId: {
    type: String
  },
});
</script>

<template lang="pug">
label.block.mb-1.text-gray-900(
  :for="forId"
)
  slot
</template>