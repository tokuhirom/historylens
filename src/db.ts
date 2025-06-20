export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req: IDBOpenDBRequest = indexedDB.open('HistoryLensDB', 7);

    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;

      // Create activity store for new installations
      if (!db.objectStoreNames.contains('activity')) {
        const store = db.createObjectStore('activity', { keyPath: 'url' });
        store.createIndex('updatedAt', 'updatedAt');
        store.createIndex('category', 'category');
      }
    };

    req.onsuccess = (e: Event) => {
      const db = (e.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    req.onerror = (e: Event) => {
      const error = (e.target as IDBOpenDBRequest).error;
      reject(error);
    };
  });
}
