import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import UserProfilePopup from './UserProfilePopup.vue'

const longEmail = 'ada.lovelace.with.a.very.long.address@analytical-engine.example.com'

describe('UserProfilePopup', () => {
  it('keeps a long email inside the card', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/people/:id', name: 'person', component: { template: '<div />' } }],
    })
    const wrapper = mount(UserProfilePopup, {
      props: {
        person: {
          id: 1,
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: longEmail,
        },
      },
      global: {
        plugins: [router],
        stubs: { Teleport: true },
      },
    })

    const email = wrapper.get('dd')
    expect(email.text()).toBe(longEmail)
    expect(email.classes()).toContain('break-all')
    expect(wrapper.html()).toContain('w-[min(19rem,calc(100vw-1.5rem))]')
    expect(wrapper.html()).not.toContain('max-width: 200px')
  })
})