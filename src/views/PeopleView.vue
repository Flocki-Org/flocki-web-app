<template lang="pug">
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