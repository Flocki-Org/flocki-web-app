<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useAuth } from '@websanova/vue-auth'
import { useSidebar } from '@/composables/useSidebar'

const auth = useAuth()
const { toggle } = useSidebar()

const logout = () => {
  auth.logout({
    redirect: {
      name: 'login'
    }
  })
}
</script>

<template lang="pug">
nav.bg-secondary.flex.items-center.gap-2(
  class="h-[76px] px-main-lr lg:ml-menu sm:gap-3"
)
  button.inline-flex.shrink-0.items-center.justify-center.w-10.h-10.rounded-md.text-gray-700(
    type="button"
    class="hover:bg-gray-50 lg:hidden"
    aria-label="Open navigation menu"
    @click="toggle()"
  )
    svg.h-6.w-6(
      viewBox="0 0 24 24"
      aria-hidden="true"
    )
      path(
        fill="currentColor"
        d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"
      )

  form.min-w-0.grow
    input.block.w-full.outline-hidden.bg-transparent.border-b-2.min-w-0(
      type="search"
      name="search"
      placeholder="Search…"
      aria-label="Search for people, sermons, events, etc."
    )

  .flex.shrink-0.flex-row-reverse.items-center
    Menu.relative.inline-block.z-10(
      as="div"
    )
      MenuButton(aria-label="Account menu")
        .shrink.bg-white.p-1.rounded-full.flex.flex-row.items-center.transition-all.cursor-pointer(class="hover:bg-gray-50")
          img.w-8.h-8.rounded-full(
            class="sm:mr-2"
            src="@/assets/temp/user-profile-pic.png"
            alt=""
          )
          span.mr-2(
            class="hidden md:inline"
          ) Adam
          svg.w-6.h-6(
            class="mr-1 sm:mr-2"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        MenuItems.absolute.right-0.mt-2.w-40.origin-top-right.divide-y.divide-gray-100.rounded-md.bg-white.shadow-lg.ring-1.divide-y.divide-gray-300(class="ring-black/5 focus:outline-hidden")
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
                @click="logout()"
              ) Log out

    button.inline-flex.relative.items-center.rounded-lg.transition-all(
      type="button"
      class="px-2 sm:px-3 mr-1 sm:mr-4 hover:bg-gray-50"
      aria-label="Notifications"
    )
      svg(
        style="width:24px;height:24px"
        viewBox="0 0 24 24"
        aria-hidden="true"
      )
        path(
          fill="currentColor"
          d="M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z"
        )
      .inline-flex.absolute.top-1.right-0.justify-center.items-center.w-6.h-5.text-sm.text-white.bg-red-400.rounded-md.border-2.border-white 5
</template>
