export type StoredImage = {
  id: string
  imageUrl: string
  prompt: string
  createdAt: string
}

const STORAGE_KEY = 'rightcodes-history'
const MAX_ITEMS = 24

function isStoredImageShape(value: unknown): value is Omit<StoredImage, 'createdAt'> & { createdAt?: unknown } {
  return Boolean(value) && typeof value === 'object' && typeof (value as { id?: unknown }).id === 'string' && typeof (value as { imageUrl?: unknown }).imageUrl === 'string' && typeof (value as { prompt?: unknown }).prompt === 'string'
}

export function readHistory(): StoredImage[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(isStoredImageShape)
      .map((item) => ({
        id: item.id,
        imageUrl: item.imageUrl,
        prompt: item.prompt,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : ''
      }))
      .slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

export function writeHistory(items: StoredImage[]) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
  } catch {
    // Storage can be unavailable in restricted browsing contexts.
  }
}
