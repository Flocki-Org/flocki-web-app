import { axios } from '@/axios'
import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('@/views/SetupChurchWizard.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/AuthenticatedLayout.vue'),
      meta: {
        auth: true,
      },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          beforeEnter: checkIfChurchExists,
        },
        {
          path: 'people/settings',
          name: 'people-settings',
          component: () => import('@/views/EmptyView.vue'),
        },
        {
          path: 'people',
          name: 'people',
          component: () => import('@/views/People/PeopleListView.vue'),
        },
        {
          path: 'people/:id',
          name: 'person',
          component: () => import('@/views/People/PersonView.vue'),
        },
        {
          path: 'households',
          name: 'households',
          component: () => import('@/views/People/HouseholdListView.vue'),
        },
        {
          path: 'groups',
          name: 'groups',
          component: () => import('@/views/People/GroupListView.vue'),
        },
        {
          path: 'groups/:id',
          name: 'group',
          component: () => import('@/views/People/GroupView.vue'),
        },
        {
          path: 'households/:id',
          name: 'household',
          component: () => import('@/views/People/HouseholdView.vue'),
        },
        {
          path: 'sermons',
          name: 'sermons',
          component: () => import('@/views/EmptyView.vue'),
        },
        {
          path: 'ministries',
          name: 'ministries',
          component: () => import('@/views/Ministries/MinistryListView.vue'),
        },
        {
          path: 'ministries/:id',
          name: 'ministry',
          component: () => import('@/views/Ministries/MinistryView.vue'),
        },
        {
          path: 'events',
          name: 'events',
          component: () => import('@/views/Events/EventsCalendarView.vue'),
        },
        {
          path: 'events/types',
          name: 'event-types',
          component: () => import('@/views/Events/EventTypesView.vue'),
        },
        {
          path: 'events/series/:seriesId/template',
          name: 'service-template',
          component: () => import('@/views/Events/ServicePlanView.vue'),
          props: { template: true },
        },
        {
          path: 'events/:seriesId/:date',
          name: 'event-occurrence',
          component: () => import('@/views/Events/EventOccurrenceView.vue'),
        },
        {
          path: 'services',
          name: 'services',
          component: () => import('@/views/Events/ServicesView.vue'),
        },
        {
          path: 'services/:seriesId/:date',
          name: 'service-plan',
          component: () => import('@/views/Events/ServicePlanView.vue'),
        },
        {
          path: 'worship',
          name: 'songs',
          component: () => import('@/views/Worship/SongListView.vue'),
        },
        {
          path: 'worship/ccli',
          name: 'ccli-report',
          component: () => import('@/views/Worship/CcliReportView.vue'),
        },
        {
          path: 'worship/:id',
          name: 'song',
          component: () => import('@/views/Worship/SongView.vue'),
        },
        {
          path: 'giving',
          name: 'giving',
          component: () => import('@/views/EmptyView.vue'),
        },
        {
          path: 'website',
          name: 'website',
          component: () => import('@/views/EmptyView.vue'),
        },
      ],
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash }
    }

    return { top: 0 }
  },
})

export default router

function checkIfChurchExists(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  axios
    .get('/church')
    .then(() => {
      next()
    })
    .catch((err) => {
      console.log(err)
      next({ name: 'setup' })
    })
}

router.beforeEach((to, from, next) => {
  axios
    .get('/church')
    .then((response) => {
      document.title = 'Flocki - ' + response.data.name
      next()
    })
    .catch((error) => {
      console.error('Error fetching data:', error)
      next()
    })
})
