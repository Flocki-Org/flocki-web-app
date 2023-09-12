<template lang="pug">
.bg-white.fixed.top-0.left-0.bottom-0(class="w-[300px] shadow-[0px_0px_30px_rgba(0,0,0,0.15)]")
  .h-full.overflow-y-auto.w-full
    .logo.px-8.mt-2.flex.items-center(class="h-[76px]")
      router-link(
        to="/"
      )
        img.hover_opacity-80.transition-all(
          :src="getFullImageUrl('/church/logo')"
          onerror="this.src = ''"
          width="60"
        )

    ul.flex.flex-col.mt-4
      li(v-for="item in menu")
        component(
          :is="item.to ? 'router-link' : 'button'"
          :class="menuItemClass"
          :to="item.to ? item.to : ''"
          :exact-active-class="item.subMenu ? '' : '!text-sky-500 bg-main'"
        )
          svg.h-6.w-6(
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              :d="item.svgIcon"
            )
          span.ml-2.flex-1.text-left {{ item.name }}
          svg.h-6.w-6(
            v-if="item.subMenu"
            :class="checkIfSubmenuShouldDisplay(item, $route) ? 'rotate-180' : ''"
            viewBox="0 0 24 24"
          )
            path(
              fill="currentColor"
              d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
            )

        ul(v-if="item.subMenu && checkIfSubmenuShouldDisplay(item, $route)")
          li(v-for="subItem in item.subMenu")
            router-link.flex.items-center.px-8.text-gray-800.no-underline.py-4.hover_bg-main(
              :to="subItem.to"
              active-class="!text-sky-500 bg-main"
            )
              span.ml-8 {{ subItem.name }}
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFullImageUrl } from '@/imageUtils';

const route = useRoute()
const currentSubmenu = ref('')

const menuItemClass = "flex items-center px-8 py-4 w-full text-gray-800 no-underline hover_bg-main"

const menu = [
  {
    name: "Dashboard",
    to: {
      name: 'dashboard'
    },
    svgIcon: "M9 17H7V10H9V17M13 17H11V7H13V17M17 17H15V13H17V17M19 19H5V5H19V19.1M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
  },
  {
    name: "People",
    to: {
      name: 'people'
    },
    svgIcon: "M13.07 10.41A5 5 0 0 0 13.07 4.59A3.39 3.39 0 0 1 15 4A3.5 3.5 0 0 1 15 11A3.39 3.39 0 0 1 13.07 10.41M5.5 7.5A3.5 3.5 0 1 1 9 11A3.5 3.5 0 0 1 5.5 7.5M7.5 7.5A1.5 1.5 0 1 0 9 6A1.5 1.5 0 0 0 7.5 7.5M16 17V19H2V17S2 13 9 13 16 17 16 17M14 17C13.86 16.22 12.67 15 9 15S4.07 16.31 4 17M15.95 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13Z",
    subMenu: [
      {
        name: "All people",
        to: {
          name: 'people'
        },
        openForPath: '/people',
      },
      {
        name: "Households",
        to: {
          name: 'households'
        },
        openForPath: '/households',
      },
      {
        name: "Settings",
        to: {
          name: 'people-settings'
        }
      },
    ]
  },
  {
    name: "Sermons",
    to: {
      name: 'sermons'
    },
    svgIcon: "M6.1,10L4,18V8H21A2,2 0 0,0 19,6H12L10,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H19C19.9,20 20.7,19.4 20.9,18.5L23.2,10H6.1M19,18H6L7.6,12H20.6L19,18Z"
  },
  {
    name: "Ministries",
    to: {
      name: 'ministries'
    },
    svgIcon: "M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z"
  },
  {
    name: "Events",
    to: {
      name: 'events'
    },
    svgIcon: "M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"
  },
  {
    name: "Giving",
    to: {
      name: 'giving'
    },
    svgIcon: "M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"
  },
  {
    name: "Website",
    to: {
      name: 'website'
    },
    svgIcon: "M22,17H18V10H22M23,8H17A1,1 0 0,0 16,9V19A1,1 0 0,0 17,20H23A1,1 0 0,0 24,19V9A1,1 0 0,0 23,8M4,6H22V4H4A2,2 0 0,0 2,6V17H0V20H14V17H4V6Z"
  }
]

const checkIfSubmenuShouldDisplay = (menuItem, route) => {
  return menuItem.subMenu.some(item => item.to.name === route.name || (item.openForPath && route.path.startsWith(item.openForPath))) || currentSubmenu.value === menuItem.name
}

const setCurrentSubmenu = (name) => {
  currentSubmenu.value = (currentSubmenu.value === name ? '' : name)
}

setCurrentSubmenu(route.name)

watch(route, () => setCurrentSubmenu(route.name)) 

</script>