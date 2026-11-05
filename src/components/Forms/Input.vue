<script setup lang="ts">
defineProps({
  id: {},
  type: {
    type: String
  },
  placeholder: {
    type: String
  },
  modelValue: {}
});

defineEmits(['update:modelValue'])
</script>

<template lang="pug">
input.outline-hidden.bg-gray-50.border.border-gray-300.text-gray-900.rounded-lg.block.w-full.p-3(
  class="focus:border-blue-300 focus-visible:border-blue-300"
  :id="id"
  :type="type"
  :placeholder="placeholder"
  :value="modelValue"
  @input="$emit('update:modelValue', $event.target.value)"
)
</template>