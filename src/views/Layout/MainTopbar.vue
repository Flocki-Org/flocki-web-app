<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
</script>

<template lang="pug">
nav.bg-secondary.px-main-lr.flex.items-center.ml-menu(class="h-[76px]")
  form.grow
    input.block.w-full.outline-none.bg-transparent.border-b-2(
      type="text"
      name="search"
      placeholder="Search for people, sermons, events, etc..."
    )

  .grow.flex.flex-row-reverse
    Menu.relative.inline-block(
      as="div"
    )
      MenuButton
        .shrink.bg-white.hover_bg-gray-50.p-1.rounded-full.flex.flex-row.items-center.transition-all.cursor-pointer
          img.w-8.h-8.mr-2.rounded-full(
            src="@/assets/temp/user-profile-pic.png"
          )
          .mr-2 Adam
          svg.w-6.h-6.mr-2(
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
            )

      transition(
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      )
        MenuItems.absolute.right-0.mt-2.w-40.origin-top-right.divide-y.divide-gray-100.rounded-md.bg-white.shadow-lg.ring-1.ring-black.ring-opacity-5.focus_outline-none.divide-y.divide-gray-300
          .px-1.py-1
            MenuItem(v-slot="{ active }")
              button.group.flex.w-full.items-center.rounded-md.px-2.py-2(
                :class="[active ? 'bg-sky-500 text-white' : 'text-gray-900']"
              ) Profile
            MenuItem(v-slot="{ active }")
              button.group.flex.w-full.items-center.rounded-md.px-2.py-2(
                :class="[active ? 'bg-sky-500 text-white' : 'text-gray-900']"
              ) Settings
          .px-1.py-1
            MenuItem(v-slot="{ active }")
              button.group.flex.w-full.items-center.rounded-md.px-2.py-2(
                :class="[active ? 'bg-sky-500 text-white' : 'text-gray-900']"
              ) Log out

    button.inline-flex.relative.items-center.px-3.rounded-lg.mr-4.hover_bg-gray-50.transition-all
      svg(
        style="width:24px;height:24px"
        viewBox="0 0 24 24"
      )
        path(
          fill="currentColor"
          d="M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z"
        )
      .inline-flex.absolute.top-1.right-0.justify-center.items-center.w-6.h-5.text-sm.text-white.bg-red-400.rounded-md.border-2.border-white 5
</template>