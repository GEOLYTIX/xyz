export async function openDB() {

  const OpenDBPromise = new Promise((resolve, reject) => {

    const OpenDBRequest = indexedDB.open(`${mapp.user.email} - ${mapp.user.title}`, 3);

    OpenDBRequest.onerror = (event) => {
      console.error(event);
      reject(OpenDBRequest)
    };

    OpenDBRequest.onsuccess = (event) => {
      resolve(event.target.result)
    }

    OpenDBRequest.onupgradeneeded = (event) => {
      event.target.result.createObjectStore('locales', { keyPath: "key" });
      //resolve(event.target.result)
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

export async function get(store, key) {

  const db = await openDB()

  if (!db.objectStoreNames.contains(store)) {

    console.warn(`UserIDB doesn't contain "${store}" objectStore.`)

    return
  }

  const getPromise = new Promise((resolve, reject) => {

    const transaction = db.transaction([store], "readwrite");

    const objectStore = transaction.objectStore(store)

    const request = objectStore.get(key);

    request.onerror = (event) => {
      console.error(event)
      reject(request)
    };

    request.onsuccess = (event) => {
      console.log(event)
      resolve(request.result)
    };
  })

  await getPromise

  return getPromise
}

export async function add(store, obj) {

  const db = await openDB()

  if (!db.objectStoreNames.contains(store)) {

    console.warn(`UserIDB doesn't contain "${store}" objectStore.`)

    return
  }

  const storePromise = new Promise((resolve, reject) => {

    const transaction = db.transaction([store], "readwrite");

    const objectStore = transaction.objectStore(store)

    const request = objectStore.add(obj);

    request.onerror = (event) => {
      console.error(event)
      reject(request)
    };

    request.onsuccess = (event) => {
      console.log(event)
      resolve(event.target.result)
    };
  })

  await storePromise

  return storePromise
}