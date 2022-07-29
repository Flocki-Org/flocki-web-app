<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
</script>

<template lang="pug">
aside.h-full.bg-white.absolute(class="w-[300px] shadow-[0px_0px_30px_rgba(0,0,0,0.15)]")
  .h-full.overflow-y-auto
    .logo.px-8.flex.items-center(class="h-[76px]")
      router-link(
        to="/"
      )
        img.hover_opacity-80.transition-all(
          src="@/assets/lsbc-logo.svg"
          width="185"
        )

    ul.flex.flex-col.mt-6
      li
        router-link.flex.items-center.px-8.py-4.text-gray-800.no-underline.hover_bg-main(
          to="/"
        )
          svg.h-6.w-6(
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M9 17H7V10H9V17M13 17H11V7H13V17M17 17H15V13H17V17M19 19H5V5H19V19.1M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
            )
          span.ml-2 Dashboard
      li
        button.flex.items-center.text-base.px-8.py-4.w-full.group.hover_bg-main
          svg.flex-shrink-0.w-6.h-6(
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M13.07 10.41A5 5 0 0 0 13.07 4.59A3.39 3.39 0 0 1 15 4A3.5 3.5 0 0 1 15 11A3.39 3.39 0 0 1 13.07 10.41M5.5 7.5A3.5 3.5 0 1 1 9 11A3.5 3.5 0 0 1 5.5 7.5M7.5 7.5A1.5 1.5 0 1 0 9 6A1.5 1.5 0 0 0 7.5 7.5M16 17V19H2V17S2 13 9 13 16 17 16 17M14 17C13.86 16.22 12.67 15 9 15S4.07 16.31 4 17M15.95 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13Z"
            )
          span.ml-2.flex-1.text-left.whitespace-nowrap People
          svg.w-6.h-6(
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
            )
      li
        router-link.flex.items-center.px-8.text-gray-800.no-underline.py-4.hover_bg-main(
          to="/"
        )
          svg.h-6.w-6(
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M6.1,10L4,18V8H21A2,2 0 0,0 19,6H12L10,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H19C19.9,20 20.7,19.4 20.9,18.5L23.2,10H6.1M19,18H6L7.6,12H20.6L19,18Z"
            )
          span.ml-2 Sermons

      li
        router-link.flex.items-center.px-8.text-gray-800.no-underline.py-4.hover_bg-main(
          to="/"
        )
          svg.h-6.w-6(
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z"
            )
          span.ml-2 Ministries

      li
        router-link.flex.items-center.px-8.text-gray-800.no-underline.py-4.hover_bg-main(
          to="/"
        )
          svg.h-6.w-6(
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"
            )
          span.ml-2 Events

      li
        router-link.flex.items-center.px-8.text-gray-800.no-underline.py-4.hover_bg-main(
          to="/"
        )
          svg.h-6.w-6(
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"
            )
          span.ml-2 Giving

      li
        router-link.flex.items-center.px-8.text-gray-800.no-underline.py-4.hover_bg-main(
          to="/"
        )
          svg.h-6.w-6(
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M22,17H18V10H22M23,8H17A1,1 0 0,0 16,9V19A1,1 0 0,0 17,20H23A1,1 0 0,0 24,19V9A1,1 0 0,0 23,8M4,6H22V4H4A2,2 0 0,0 2,6V17H0V20H14V17H4V6Z"
            )
          span.ml-2 Website

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
        MenuItems.absolute.right-0.mt-2.w-40.origin-top-right.divide-y.divide-gray-100.rounded-md.bg-white.shadow-lg.ring-1.ring-black.ring-opacity-5.focus_outline-none
          .px-1.py-1
            MenuItem(v-slot="{ active }")
              button.group.flex.w-full.items-center.rounded-md.px-2.py-2(
                :class="[active ? 'bg-sky-500 text-white' : 'text-gray-900']"
              ) Profile
            MenuItem(v-slot="{ active }")
              button.group.flex.w-full.items-center.rounded-md.px-2.py-2(
                :class="[active ? 'bg-sky-500 text-white' : 'text-gray-900']"
              ) Settings

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

#people-list.ml-menu.py-main-tb
  .flex.items-center.px-main-lr.mb-10
    h1.grow All People

    button.text-white.bg-sky-500.hover_bg-sky-400.font-medium.rounded-lg.px-5.py-2.inline-flex.items-center.cursor-pointer.transition-all
      svg.mr-2(
        style="width:16px;height:16px"
        viewBox="0 0 24 24"
      )
        path(
          fill="currentColor"
          d="M15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4M15,5.9C16.16,5.9 17.1,6.84 17.1,8C17.1,9.16 16.16,10.1 15,10.1A2.1,2.1 0 0,1 12.9,8A2.1,2.1 0 0,1 15,5.9M4,7V10H1V12H4V15H6V12H9V10H6V7H4M15,13C12.33,13 7,14.33 7,17V20H23V17C23,14.33 17.67,13 15,13M15,14.9C17.97,14.9 21.1,16.36 21.1,17V18.1H8.9V17C8.9,16.36 12,14.9 15,14.9Z"
        )
      | Add person

  .bg-white.w-full
    .flex.py-2.px-main-lr.items-center.border-b.border-gray-100
      .grow
        button.w-8.h-8.mr-2.inline-flex.justify-center.items-center.rounded-md.border.border-gray-300.text-gray-400
          svg(
            style="width:16px;height:16px"
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"
            )

        button.w-8.h-8.mr-2.inline-flex.justify-center.items-center.rounded-md.border.border-gray-300.text-gray-400
          svg.rotate-90(
            style="width:16px;height:16px"
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M17,20.41L18.41,19L15,15.59L13.59,17M7.5,8H11V13.59L5.59,19L7,20.41L13,14.41V8H16.5L12,3.5"
            )

        button.w-8.h-8.mr-2.inline-flex.justify-center.items-center.rounded-md.border.border-gray-300.text-gray-400
          svg(
            style="width:16px;height:16px"
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M16,17H5V7H16L19.55,12M17.63,5.84C17.27,5.33 16.67,5 16,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H16C16.67,19 17.27,18.66 17.63,18.15L22,12L17.63,5.84Z"
            )

        button.w-8.h-8.mr-2.inline-flex.justify-center.items-center.rounded-md.border.border-gray-300.text-gray-400
          svg(
            style="width:16px;height:16px"
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22"
            )

      .flex.items-center
        span.h-7.mr-2.px-3.bg-sky-100.text-sky-400.text-sm.inline-flex.items-center.rounded-md
          | Status: Member
          svg.ml-1(
            style="width:12px;height:12px"
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
            )

        button.h-7.mr-2.px-2.text-sm.inline-flex.items-center.rounded-md.border.border-dashed.border-sky-400.hover_border-sky-300.text-sky-400.bg-transparent.hover_bg-sky-50.transition-all
          svg.mr-1(
            style="width:16px;height:16px"
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M15 17H18V14H20V17H23V19H20V22H18V19H15V17M13 19.88C13.04 20.18 12.94 20.5 12.72 20.71C12.32 21.1 11.69 21.1 11.3 20.71L7.29 16.7C7.06 16.47 6.96 16.16 7 15.87V10.75L2.21 4.62C1.87 4.19 1.95 3.56 2.38 3.22C2.57 3.08 2.78 3 3 3V3H17V3C17.22 3 17.43 3.08 17.62 3.22C18.05 3.56 18.13 4.19 17.79 4.62L13 10.75V19.88M5.04 5L9 10.07V15.58L11 17.58V10.05L14.96 5H5.04Z"
            )
          | Add filter

        button.w-8.h-7.mr-2.inline-flex.justify-center.items-center.rounded-md.border.border-sky-400.hover_border-sky-300.text-sky-400.bg-transparent.hover_bg-sky-50.transition-all
          svg(
            style="width:16px;height:16px"
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M11,2A2,2 0 0,1 13,4V20A2,2 0 0,1 11,22H2V2H11M4,10V14H11V10H4M4,16V20H11V16H4M4,4V8H11V4H4M15,11H18V8H20V11H23V13H20V16H18V13H15V11Z"
            )

        button.w-8.h-7.inline-flex.justify-center.items-center.rounded-md.border.border-sky-400.hover_border-sky-300.text-sky-400.bg-transparent.hover_bg-sky-50.transition-all
          svg(
            style="width:16px;height:16px"
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"
            )

    table.table-auto.w-full.text-left.text-sm
      thead.text-gray-500.border-b.border-gray-100
        tr
          th.py-3.w-main-lr
            .flex.items-center.justify-around
              input.form-check-input.appearance-none.w-4.h-4.bg-gray-100.checked_bg-sky-500.rounded.border.border-gray-300.hover_border-sky-500.transition-all.align-top.bg-no-repeat.bg-center.bg-contain.checked_bg-check(
                type="checkbox"
                value=""
              )
          th.py-3 First name
          th.py-3 Last name
          th.py-3 Email
          th.py-3 Phone number
          th.py-3 Created at
          th.py-3.w-main-lr
      tbody
        tr
          td.py-3.w-main-lr
            .flex.items-center.justify-around
              input.form-check-input.appearance-none.w-4.h-4.bg-gray-100.checked_bg-sky-500.rounded.border.border-gray-300.hover_border-sky-500.transition-all.align-top.bg-no-repeat.bg-center.bg-contain.checked_bg-check(
                type="checkbox"
                value=""
              )
          td.py-3.flex.items-center
            img.w-8.h-8.mr-2.rounded-full(
              src="@/assets/temp/user-profile-pic.png"
            )
            | Alisa 
          td.py-3 Newton
          td.py-3 alisa0929@yahoo.com
          td.py-3 0792340927
          td.py-3 23 March '22, 11:13pm
          td.py-3
          td.py-3.w-main-lr
        tr.hover_bg-sky-100
          td.py-3.w-main-lr
            .flex.items-center.justify-around
              input.form-check-input.appearance-none.w-4.h-4.bg-gray-100.checked_bg-sky-500.rounded.border.border-gray-300.hover_border-sky-500.transition-all.align-top.bg-no-repeat.bg-center.bg-contain.checked_bg-check(
                type="checkbox"
                value=""
              )
          td.py-3.flex.items-center
            img.w-8.h-8.mr-2.rounded-full(
              src="@/assets/temp/user-profile-pic.png"
            )
            | Andrew 
          td.py-3 Levinsohn
          td.py-3 andrew.levinsohn@gmail.com
          td.py-3 0815972198
          td.py-3 12 Dec '21, 08:48pm
          td.py-3.w-8.text-right
            button.w-8.h-7.inline-flex.justify-center.items-center.rounded-md.border.border-transparent.text-sky-400.hover_bg-gray-50
              svg(
                style="width:16px;height:16px"
                viewBox="0 0 24 24"
              )
                path(
                  fill="currentColor"
                  d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"
                )
          td.py-3.w-main-lr
        tr
          td.py-3.w-main-lr
            .flex.items-center.justify-around
              input.form-check-input.appearance-none.w-4.h-4.bg-gray-100.checked_bg-sky-500.rounded.border.border-gray-300.hover_border-sky-500.transition-all.align-top.bg-no-repeat.bg-center.bg-contain.checked_bg-check(
                type="checkbox"
                value=""
              )
          td.py-3.flex.items-center
            img.w-8.h-8.mr-2.rounded-full(
              src="@/assets/temp/user-profile-pic.png"
            )
            | Ashton 
          td.py-3 Anderson
          td.py-3 andersona@bigcorporate.com
          td.py-3 0674896555
          td.py-3 1 Feb '22, 12:05pm
          td.py-3
          td.py-3.w-main-lr
</template>