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
input.outline-hidden.bg-white.border.border-gray-300.text-gray-900.rounded-md.block.w-full.px-3.text-sm.transition-colors(
  class="py-2.5 placeholder:text-gray-400 focus:border-sky-500 focus-visible:border-sky-500"
  :id="id"
  :type="type"
  :placeholder="placeholder"
  :value="modelValue"
  @input="$emit('update:modelValue', $event.target.value)"
)
</template>
