export type StoredImage = {
  id: string
  imageUrl: string
  prompt: string
  createdAt: string
  cachedImageKey?: string
  localImageUrl?: string
}

export const STORAGE_KEY = 'rightcodes-history'
export const MAX_HISTORY_ITEMS = 24

function isStoredImage(value: unknown): value is StoredImage {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { imageUrl?: unknown }).imageUrl === 'string' &&
    typeof (value as { prompt?: unknown }).prompt === 'string' &&
    typeof (value as { createdAt?: unknown }).createdAt === 'string' &&
    (typeof (value as { cachedImageKey?: unknown }).cachedImageKey === 'undefined' || typeof (value as { cachedImageKey?: unknown }).cachedImageKey === 'string')
  )
}

function toPersistedImage(item: StoredImage) {
  const { localImageUrl, ...persistedItem } = item
  return persistedItem
}

export function readHistory(): StoredImage[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(isStoredImage)
      .slice(0, MAX_HISTORY_ITEMS)
  } catch {
    return []
  }
}

export function writeHistory(items: StoredImage[]) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS).map(toPersistedImage)))
  } catch {
    // Storage can be unavailable in restricted browsing contexts.
  }
}
