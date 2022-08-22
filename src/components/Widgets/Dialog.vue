
<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

const props = defineProps({
  title: {
    type: String
  },
  show: {
    type: Boolean,
    default: false
  },
});
</script>

<template lang="pug">
TransitionRoot(
  appear
  :show="show"
  as="template"
)
  Dialog.relative.z-50(
    as="div"
    @close="$emit('close')"
  )
    TransitionChild(
      enter="duration-300 ease-out"
      enter-from="opacity-0"
      enter-to="opacity-100"
      leave="duration-200 ease-in"
      leave-from="opacity-100"
      leave-to="opacity-0"
    )
      .fixed.inset-0.bg-black.bg-opacity-40

    .fixed.inset-0.overflow-y-auto
      .flex.min-h-full.items-center.justify-center.p-4.text-center
        TransitionChild(
          enter="duration-300 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        )
          DialogPanel.w-full.max-w-md.transform.overflow-hidden.rounded-2xl.bg-white.p-6.text-left.align-middle.shadow-xl.transition-all
            DialogTitle.text-lg.font-medium.mb-4.leading-6.text-gray-900(
              as="h3"
            ) {{ title }}

            slot
</template>