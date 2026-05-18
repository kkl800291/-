import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cacheHistoryImage, createHistoryImageObjectUrl, deleteHistoryImageBlob, readHistoryImageBlob, saveHistoryImageBlob } from '@/lib/historyImages'

const stores = new Map<string, unknown>()

class FakeObjectStore {
  get(key: string) {
    return createRequest(() => stores.get(key))
  }

  put(value: unknown, key: string) {
    return createRequest(() => {
      stores.set(key, value)
      return key
    })
  }

  delete(key: string) {
    return createRequest(() => {
      stores.delete(key)
      return undefined
    })
  }
}

function createRequest<T>(resolveValue: () => T) {
  const request = {} as IDBRequest<T>
  queueMicrotask(() => {
    Object.defineProperty(request, 'result', { value: resolveValue(), configurable: true })
    request.onsuccess?.({ target: request } as unknown as Event)
  })
  return request
}

class FakeTransaction {
  error = null
  onabort: ((event: Event) => void) | null = null
  oncomplete: ((event: Event) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  objectStore() {
    queueMicrotask(() => this.oncomplete?.({} as Event))
    return new FakeObjectStore()
  }
}

class FakeDatabase {
  objectStoreNames = {
    contains: () => true
  } as unknown as DOMStringList

  close = vi.fn()

  createObjectStore = vi.fn()

  transaction() {
    return new FakeTransaction() as unknown as IDBTransaction
  }
}

beforeEach(() => {
  stores.clear()
  Object.defineProperty(window, 'indexedDB', {
    configurable: true,
    value: {
      open: () => {
        const request = {} as IDBOpenDBRequest
        queueMicrotask(() => {
          Object.defineProperty(request, 'result', { value: new FakeDatabase(), configurable: true })
          request.onsuccess?.({ target: request } as unknown as Event)
        })
        return request
      }
    }
  })
  vi.stubGlobal('fetch', vi.fn())
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn()
  })
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:history-image')
})

describe('history image cache', () => {
  it('stores and restores image blobs by key', async () => {
    const blob = new Blob(['image-bytes'], { type: 'image/png' })

    await saveHistoryImageBlob('image-1', blob)

    expect(await readHistoryImageBlob('image-1')).toBe(blob)
    await expect(createHistoryImageObjectUrl('image-1')).resolves.toBe('blob:history-image')
  })

  it('fetches a generated image and stores the returned blob', async () => {
    const blob = new Blob(['downloaded-image'], { type: 'image/png' })
    vi.mocked(fetch).mockResolvedValue(new Response(blob))

    await cacheHistoryImage('image-2', '/api/download-image?url=https%3A%2F%2Fcdn.example.com%2Fgenerated.png')

    expect(fetch).toHaveBeenCalledWith('/api/download-image?url=https%3A%2F%2Fcdn.example.com%2Fgenerated.png', { cache: 'no-store' })
    await expect(readHistoryImageBlob('image-2')).resolves.toBeInstanceOf(Blob)
  })

  it('deletes cached image blobs by key', async () => {
    await saveHistoryImageBlob('image-3', new Blob(['image-bytes'], { type: 'image/png' }))

    await deleteHistoryImageBlob('image-3')

    await expect(readHistoryImageBlob('image-3')).resolves.toBeUndefined()
  })
})
