/// <reference types="vite/client" />

import type { DateFilters } from './src/utils/dates'

export {}

interface RuntimeEnv {
  APP_API_PROTOCOL?: string
  APP_API_URL?: string
  APP_API_PORT?: string
}

declare global {
  interface Window {
    _env_?: RuntimeEnv
  }

  interface HTMLElement {
    _leaflet_id?: number
  }

  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $filters: DateFilters
  }
}

declare module '@websanova/vue-auth/dist/drivers/http/axios.1.x.esm.js' {
  const driver: object
  export default driver
}

declare module '@websanova/vue-auth/dist/drivers/oauth2/google.esm.js' {
  const driver: object
  export default driver
}

declare module '@websanova/vue-auth/dist/drivers/router/vue-router.2.x.esm.js' {
  const driver: object
  export default driver
}

declare module '@/drivers/auth/bearer.js' {
  const driver: object
  export default driver
}
