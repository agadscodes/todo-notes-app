const DB_NAME = 'todo-notes-app'
const STORE_NAME = 'audio'

function openAudioStore() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open indexedDB.'))
  })
}

export async function saveAudioRecord(audioId: string, blob: Blob) {
  const db = await openAudioStore()

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(blob, audioId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Failed to save audio record.'))
  })
}

export async function getAudioRecord(audioId: string): Promise<Blob | null> {
  const db = await openAudioStore()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(audioId)

    request.onsuccess = () => {
      const result = request.result as Blob | undefined
      resolve(result ?? null)
    }
    request.onerror = () => reject(request.error ?? new Error('Failed to get audio record.'))
  })
}

export async function deleteAudioRecord(audioId: string) {
  const db = await openAudioStore()

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(audioId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Failed to delete audio record.'))
  })
}
