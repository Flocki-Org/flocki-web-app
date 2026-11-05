<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

defineProps({
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
      .fixed.inset-0(class="bg-black/40")

    .fixed.inset-0.overflow-y-auto
      .flex.min-h-full.justify-center.text-center(
        class="items-end p-3 sm:items-center sm:p-4"
      )
        TransitionChild(
          enter="duration-300 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        )
          DialogPanel.w-full.max-w-md.transform.overflow-hidden.bg-white.pt-5.text-left.align-middle.shadow-xl.transition-all(
            class="max-h-[90vh] overflow-y-auto rounded-t-xl border border-gray-100 sm:rounded-xl"
          )
            .flex.items-center.mb-5(
              class="px-4 sm:px-6"
            )
              DialogTitle.grow.text-base.font-semibold.leading-6.text-gray-900(
                as="h3"
              ) {{ title }}
              button.w-8.h-8.inline-flex.justify-center.items-center.rounded-md.text-gray-400.transition-colors(
                class="hover:bg-gray-100 hover:text-gray-600"
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
              .pb-5(
                class="px-4 sm:px-6"
              )
                slot
              .border-t.border-gray-100.bg-gray-50.py-3(
                class="px-4 sm:px-6"
              )
                slot(
                  name="controls"
                )
</template>
