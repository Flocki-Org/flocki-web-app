const memory = new Map<string, string>()
const pending = new Map<string, Promise<string>>()

const CACHE_NAME = 'flocki-images-v1'

export function isAppImage(url: string): boolean {
  try {
    const path = new URL(url, window.location.origin).pathname
    return /\/images\/\d+$/.test(path)
  } catch {
    return false
  }
}

export function peekCachedImage(url: string): string | null {
  return memory.get(url) || null
}

export function rememberImage(url: string): Promise<string> {
  if (!url) return Promise.resolve('')
  if (!isAppImage(url)) return Promise.resolve(url)
  const cached = memory.get(url)
  if (cached) return Promise.resolve(cached)
  const existing = pending.get(url)
  if (existing) return existing

  const task = load(url).finally(() => pending.delete(url))
  pending.set(url, task)
  return task
}

async function load(url: string): Promise<string> {
  try {
    const cache = 'caches' in window ? await caches.open(CACHE_NAME) : null
    let response = cache ? await cache.match(url) : undefined
    if (!response) {
      response = await fetch(url, { credentials: 'omit' })
      if (!response.ok) return url
      if (cache) await cache.put(url, response.clone())
    }
    const blobUrl = URL.createObjectURL(await response.blob())
    memory.set(url, blobUrl)
    return blobUrl
  } catch {
    return url
  }
}
