import type { WebGLSupportCache } from './types'

const STORAGE_KEY = 'axi-blog-graphics-warning-shown'
const WEBGL_CACHE_KEY = 'axi-blog-webgl-support'
const CACHE_VERSION = '1.0'
const CACHE_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000

export function hasShownWarning(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function markWarningShown(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {}
}

export function getCachedWebGLSupport(): WebGLSupportCache | null {
  try {
    const cached = localStorage.getItem(WEBGL_CACHE_KEY)
    if (!cached) return null
    
    const data: WebGLSupportCache = JSON.parse(cached)
    const now = Date.now()
    
    if (data.version !== CACHE_VERSION || now - data.timestamp > CACHE_EXPIRE_TIME) {
      localStorage.removeItem(WEBGL_CACHE_KEY)
      return null
    }

    return data
  } catch {
    return null
  }
}

export function setCachedWebGLSupport(
  support: Omit<WebGLSupportCache, 'timestamp' | 'version'>
): void {
  try {
    const cacheData: WebGLSupportCache = {
      ...support,
      timestamp: Date.now(),
      version: CACHE_VERSION
    }
    localStorage.setItem(WEBGL_CACHE_KEY, JSON.stringify(cacheData))
  } catch {}
}