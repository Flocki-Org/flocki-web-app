<script setup lang="ts">
const props = defineProps({
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
input.outline-none.bg-gray-50.border.border-gray-300.text-gray-900.rounded-lg.focus_border-blue-300.focus-visible_border-blue-300.block.w-full.p-3(
  :id="id"
  :type="type"
  :placeholder="placeholder"
  :value="modelValue"
  @input="$emit('update:modelValue', $event.target.value)"
)
</template>