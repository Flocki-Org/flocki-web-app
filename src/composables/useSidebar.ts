import { inject, onUnmounted, provide, ref, watch, type InjectionKey, type Ref } from 'vue'

type SidebarContext = {
  isOpen: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}

const SIDEBAR_KEY: InjectionKey<SidebarContext> = Symbol('flocki-sidebar')

function setBodyScrollLocked(locked: boolean) {
  if (typeof document === 'undefined') return
  document.body.style.overflow = locked ? 'hidden' : ''
}

export function provideSidebar() {
  const isOpen = ref(false)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  watch(isOpen, (openNow) => {
    setBodyScrollLocked(openNow)
  })

  onUnmounted(() => {
    setBodyScrollLocked(false)
  })

  const context: SidebarContext = { isOpen, open, close, toggle }
  provide(SIDEBAR_KEY, context)
  return context
}

export function useSidebar() {
  const context = inject(SIDEBAR_KEY)
  if (!context) {
    throw new Error('useSidebar() must be used within AuthenticatedLayout')
  }
  return context
}
