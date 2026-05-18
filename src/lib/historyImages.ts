const DB_NAME = 'rightcodes-image-history'
const STORE_NAME = 'images'
const DB_VERSION = 1

function hasIndexedDb() {
  return typeof window !== 'undefined' && 'indexedDB' in window
}

function openHistoryImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('IndexedDB is unavailable.'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Unable to open image history database.'))
  })
}

function runImageStoreRequest<T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openHistoryImageDb().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode)
        const store = transaction.objectStore(STORE_NAME)
        const request = callback(store)

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error ?? new Error('Image history database request failed.'))
        transaction.oncomplete = () => database.close()
        transaction.onerror = () => {
          database.close()
          reject(transaction.error ?? new Error('Image history database transaction failed.'))
        }
        transaction.onabort = () => {
          database.close()
          reject(transaction.error ?? new Error('Image history database transaction was aborted.'))
        }
      })
  )
}

export async function saveHistoryImageBlob(key: string, blob: Blob) {
  await runImageStoreRequest('readwrite', (store) => store.put(blob, key))
}

export async function deleteHistoryImageBlob(key: string) {
  await runImageStoreRequest('readwrite', (store) => store.delete(key))
}

export async function readHistoryImageBlob(key: string) {
  const result = await runImageStoreRequest<Blob | undefined>('readonly', (store) => store.get(key))
  return result instanceof Blob ? result : undefined
}

export async function cacheHistoryImage(key: string, imageUrl: string) {
  const response = await fetch(imageUrl, { cache: 'no-store' })
  if (!response.ok) throw new Error('Unable to cache history image.')

  await saveHistoryImageBlob(key, await response.blob())
}

export async function createHistoryImageObjectUrl(key: string) {
  const blob = await readHistoryImageBlob(key)
  return blob ? URL.createObjectURL(blob) : undefined
}
