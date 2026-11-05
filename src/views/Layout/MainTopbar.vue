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
nav.bg-white.border-b.border-gray-200.flex.items-center.gap-2(
  class="h-[64px] px-main-lr lg:ml-menu sm:gap-3"
)
  button.inline-flex.shrink-0.items-center.justify-center.w-9.h-9.rounded-md.text-gray-600(
    type="button"
    class="hover:bg-gray-100 lg:hidden"
    aria-label="Open navigation menu"
    @click="toggle()"
  )
    svg.h-5.w-5(
      viewBox="0 0 24 24"
      aria-hidden="true"
    )
      path(
        fill="currentColor"
        d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"
      )

  form.min-w-0.grow.max-w-xl
    .relative
      svg.pointer-events-none.absolute.left-3.h-4.w-4.text-gray-400(
        class="top-1/2 -translate-y-1/2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      )
        path(
          fill="currentColor"
          d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
        )
      input.block.w-full.rounded-md.border.border-gray-200.bg-gray-50.outline-hidden.text-sm.text-gray-800.transition-colors(
        type="search"
        name="search"
        placeholder="Search people, sermons, events…"
        aria-label="Search for people, sermons, events, etc."
        class="h-9 pl-9 pr-3 placeholder:text-gray-400 focus:border-sky-400 focus:bg-white"
      )

  .flex.shrink-0.flex-row-reverse.items-center.gap-1
    Menu.relative.inline-block.z-10(
      as="div"
    )
      MenuButton.rounded-md(
        aria-label="Account menu"
      )
        .flex.flex-row.items-center.rounded-md.border.border-transparent.py-1.transition-colors.cursor-pointer(
          class="px-1.5 hover:border-gray-200 hover:bg-gray-50"
        )
          img.h-7.w-7.rounded-full.object-cover(
            class="sm:mr-2"
            src="@/assets/temp/user-profile-pic.png"
            alt=""
          )
          span.mr-1.text-sm.font-medium.text-gray-700(
            class="hidden md:inline"
          ) Adam
          svg.h-4.w-4.text-gray-500(
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
        MenuItems.absolute.right-0.mt-2.w-44.origin-top-right.divide-y.divide-gray-100.rounded-md.bg-white.shadow-lg.ring-1(class="ring-black/5 focus:outline-hidden")
          .px-1.py-1
            MenuItem(v-slot="{ active }")
              button.group.flex.w-full.items-center.rounded-md.px-2.py-2.text-sm(
                :class="[active ? 'bg-sky-50 text-sky-800' : 'text-gray-700']"
              ) Profile
            MenuItem(v-slot="{ active }")
              button.group.flex.w-full.items-center.rounded-md.px-2.py-2.text-sm(
                :class="[active ? 'bg-sky-50 text-sky-800' : 'text-gray-700']"
              ) Settings
          .px-1.py-1
            MenuItem(v-slot="{ active }")
              button.group.flex.w-full.items-center.rounded-md.px-2.py-2.text-sm(
                :class="[active ? 'bg-sky-50 text-sky-800' : 'text-gray-700']"
                @click="logout()"
              ) Log out

    button.relative.inline-flex.h-9.w-9.items-center.justify-center.rounded-md.text-gray-600.transition-colors(
      type="button"
      class="hover:bg-gray-100"
      aria-label="Notifications"
    )
      svg.h-5.w-5(
        viewBox="0 0 24 24"
        aria-hidden="true"
      )
        path(
          fill="currentColor"
          d="M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z"
        )
      span.absolute.right-1.top-1.inline-flex.h-4.min-w-4.items-center.justify-center.rounded-full.bg-red-500.px-1.font-semibold.leading-none.text-white(
        class="text-[10px]"
      ) 5
</template>
