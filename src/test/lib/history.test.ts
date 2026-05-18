import { afterEach, describe, expect, it } from 'vitest'
import { MAX_HISTORY_ITEMS, readHistory, STORAGE_KEY, type StoredImage, writeHistory } from '@/lib/history'

const baseHistoryItem: StoredImage = {
  id: 'image-1',
  imageUrl: 'https://cdn.example.com/image-1.png',
  prompt: 'A quiet studio scene',
  createdAt: '2026-05-17T09:00:00.000Z'
}

afterEach(() => {
  window.localStorage.clear()
})

describe('readHistory', () => {
  it('returns an empty list for malformed storage payloads', () => {
    window.localStorage.setItem(STORAGE_KEY, '{bad-json')

    expect(readHistory()).toEqual([])
  })

  it('reads valid stored history without losing entries', () => {
    const items: StoredImage[] = [
      baseHistoryItem,
      {
        id: 'image-2',
        imageUrl: 'https://cdn.example.com/image-2.png',
        prompt: 'A bright product render',
        createdAt: '2026-05-17T10:00:00.000Z'
      }
    ]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))

    expect(readHistory()).toEqual(items)
  })

  it('filters entries that do not match the stored image contract', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        baseHistoryItem,
        { id: 'missing-created-at', imageUrl: 'https://cdn.example.com/old.png', prompt: 'Old entry' },
        { id: 'bad-url', imageUrl: 123, prompt: 'Bad URL', createdAt: '2026-05-17T11:00:00.000Z' },
        null
      ])
    )

    expect(readHistory()).toEqual([baseHistoryItem])
  })
})

describe('writeHistory', () => {
  it('truncates stored history to the maximum item count', () => {
    const items = Array.from({ length: MAX_HISTORY_ITEMS + 1 }, (_, index): StoredImage => ({
      id: `image-${index}`,
      imageUrl: `https://cdn.example.com/image-${index}.png`,
      prompt: `Prompt ${index}`,
      createdAt: `2026-05-17T${String(index % 24).padStart(2, '0')}:00:00.000Z`
    }))

    writeHistory(items)

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(MAX_HISTORY_ITEMS)
    expect(stored).toEqual(items.slice(0, MAX_HISTORY_ITEMS))
  })

  it('does not persist temporary local object URLs', () => {
    writeHistory([{ ...baseHistoryItem, cachedImageKey: 'image-1', localImageUrl: 'blob:temporary-preview' }])

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([{ ...baseHistoryItem, cachedImageKey: 'image-1' }])
  })
})
