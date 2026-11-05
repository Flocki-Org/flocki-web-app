import axios from 'axios'
import { camelCase, isArray, isObject, isPlainObject, snakeCase } from 'lodash-es'

const transformData = (data: unknown, func: (key: string) => string): unknown => {
  if (isArray(data)) {
    return data.map((value: unknown) => transformData(value, func))
  }

  if (isPlainObject(data)) {
    const record = data as Record<string, unknown>
    const result: Record<string, unknown> = {}

    Object.keys(record).forEach((key) => {
      const value = record[key]
      result[func(key)] = isObject(value) ? transformData(value, func) : value
    })

    return result
  }

  return data
}

function resolveApiBaseUrl() {
  const runtime = window._env_

  if (runtime?.APP_API_URL && runtime.APP_API_PROTOCOL) {
    return `${runtime.APP_API_PROTOCOL}://${runtime.APP_API_URL}:${runtime.APP_API_PORT}`
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:8001'
  }

  return 'https://flocki-api.onrender.com'
}

axios.defaults.baseURL = resolveApiBaseUrl()

axios.interceptors.request.use((config) => {
  if (config.data) {
    config.data = transformData(config.data, snakeCase)
  }

  return config
})

axios.interceptors.response.use((response) => {
  if (response.data) {
    response.data = transformData(response.data, camelCase)
  }

  return response
})

export { axios }
