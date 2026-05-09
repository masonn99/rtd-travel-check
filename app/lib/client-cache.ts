// Simple in-memory cache for client components.
// Persists for the browser session — switching tabs is instant after first load.
// Uses stale-while-revalidate: returns cached data immediately, then refreshes in background.

interface CacheEntry<T> {
  data: T
  ts: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = TTL_MS
): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined

  if (hit) {
    const age = Date.now() - hit.ts
    if (age < ttl) {
      // Fresh — return immediately
      return hit.data
    }
    // Stale — return cached data now, revalidate in background
    fetcher().then(fresh => cache.set(key, { data: fresh, ts: Date.now() })).catch(() => {})
    return hit.data
  }

  // No cache — fetch and store
  const data = await fetcher()
  cache.set(key, { data, ts: Date.now() })
  return data
}

export function invalidateCache(key: string) {
  cache.delete(key)
}
