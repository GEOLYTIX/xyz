let IDB

export async function openDB(store) {

  const OpenDBPromise = new Promise((resolve, reject) => {

    // will create a new database if db/version doesn't exist.
    const IDBRequest = indexedDB.open(`${mapp.user.email} - ${mapp.user.title}`, 3);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error)
      resolve(IDBRequest)
    };

    IDBRequest.onsuccess = (event) => {

      if (!event.target.result.objectStoreNames.contains(store)) {

        console.warn(`UserIDB doesn't contain "${store}" objectStore.`)

        IDB = null
        resolve()
      }

      IDB = event.target.result
      resolve()
    }

    // will be called on database versioning.
    IDBRequest.onupgradeneeded = (event) => {
      
      // onsuccess method will be called after the object store is created.
      event.target.result.createObjectStore(store, { keyPath: "key" });
    };
  })

  await OpenDBPromise

  return OpenDBPromise
}

export function deleteDB() {

  if (!mapp.user) return;

  indexedDB.deleteDatabase(`${mapp.user.email} - ${mapp.user.title}`)

  console.log('Database deleted')
}

export async function add(store, obj) {

  if (!IDB) await openDB(store)

  const addPromise = new Promise((resolve, reject) => {

    const IDBTransaction = IDB.transaction([store], "readwrite");

    const objectStore = IDBTransaction.objectStore(store)

    const IDBRequest = objectStore.add(obj);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error)
      resolve(IDBRequest)
    };

    IDBRequest.onsuccess = (event) => {
      resolve(event.target.result)
    };
  })

  await addPromise

  return addPromise
}

export async function get(store, key) {

  if (!IDB) await openDB(store)

  const getPromise = new Promise((resolve, reject) => {

    const IDBTransaction = IDB.transaction([store], "readwrite");

    const objectStore = IDBTransaction.objectStore(store)

    const IDBRequest = objectStore.get(key);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error)
      reject(IDBRequest)
    };

    IDBRequest.onsuccess = (event) => {
      resolve(IDBRequest.result)
    };
  })

  await getPromise

  return getPromise
}

export async function put(store, obj) {

  if (!IDB) await openDB(store)
  
  const updatePromise = new Promise((resolve, reject) => {

    const IDBTransaction = IDB.transaction([store], "readwrite");

    const objectStore = IDBTransaction.objectStore(store)

    const IDBRequest = objectStore.put(obj);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error)
      reject(IDBRequest)
    };

    IDBRequest.onsuccess = (event) => {
      resolve(IDBRequest.result)
    };
  })

  await updatePromise

  return updatePromise
}