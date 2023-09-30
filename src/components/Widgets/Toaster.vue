<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String
  },
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'error',
    validator: (val) => ['error', 'warning', 'info', 'success'].includes(val)
  },
  canClose: {
    type: Boolean,
    default: true
  }
})

const getIcon = computed(() => {
  if (props.type === 'warning') {
    return 'M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z'
  } else if (props.type === 'info' || props.type === 'success') {
    return 'M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.14,8.77C11.95,8.87 8.7,11.46 8.7,11.46C8.5,11.61 8.56,11.6 8.72,11.88C8.88,12.15 8.86,12.17 9.05,12.04C9.25,11.91 9.58,11.7 10.13,11.36C12.25,10 10.47,13.14 9.56,18.43C9.2,21.05 11.56,19.7 12.17,19.3C12.77,18.91 14.38,17.8 14.54,17.69C14.76,17.54 14.6,17.42 14.43,17.17C14.31,17 14.19,17.12 14.19,17.12C13.54,17.55 12.35,18.45 12.19,17.88C12,17.31 13.22,13.4 13.89,10.71C14,10.07 14.3,8.67 13.14,8.77Z'
  } else {
    return 'M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z'
  }
})
</script>

<template lang="pug">
.absolute.top-0.left-0.right-0(
  v-if="show"
)
  .m-auto.flex.max-w-min.relative.my-5.items-center.p-4.text-gray-500.bg-white.rounded-lg.shadow
    .inline-flex.flex-shrink-0.justify-center.items-center.w-8.h-8.rounded-lg(
      :class="{ 'text-red-500 bg-red-100': type === 'error', 'text-orange-500 bg-orange-100': type === 'warning', 'text-gray-500 bg-gray-100': type === 'info', 'text-green-500 bg-green-100': type === 'success' }"
    )
      svg(
        aria-hidden="true"
        style="width:18px;height:18px"
        viewBox="0 0 24 24"
        fill="currentColor"
      )
        path(
          fill-rule="evenodd"
          fill="currentColor"
          :d="getIcon"
        )
    .ml-3.text-sm.font-normal.whitespace-nowrap(
      :class="{ 'text-red-500': type === 'error', 'text-orange-500': type === 'warning',  }"
    ) {{ message }}
    button.ml-8.w-8.h-8.inline-flex.justify-center.items-center.rounded-md.text-gray-400.bg-white.hover_bg-gray-100.transition-all(
      @click="$emit('close')"
    )
      svg(
        style="width:16px;height:16px"
        viewBox="0 0 24 24"
      )
        path(
          fill="currentColor"
          d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
        )
</template>