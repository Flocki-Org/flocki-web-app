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
  isForm: {
    type: Boolean,
    default: false
  },
  initialFocus: {
    type: Object,
    default: null
  }
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
    :initialFocus="initialFocus"
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
          DialogPanel.w-full.max-w-md.transform.overflow-hidden.rounded-2xl.bg-white.pt-6.text-left.align-middle.shadow-xl.transition-all
            .flex.items-center.mb-6.px-8
              DialogTitle.grow.text-lg.font-bold.leading-6.text-gray-700(
                as="h3"
              ) {{ title }}
              button.w-8.h-8.inline-flex.justify-center.items-center.rounded-md.text-gray-400.bg-gray-50.hover_bg-gray-100.transition-all(
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
            component(
              :is="isForm ? 'form' : 'div'"
              @submit.prevent="$emit('submit')"
            )
              .px-8.pb-6
                slot
              .bg-gray-100.px-8.py-4
                slot(
                  name="controls"
                )
</template>