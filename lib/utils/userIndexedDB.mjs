/** 
### mapp.utils.userIndexedDB

The module exports method to store and retrieve objects from a userIndexedDB.

@module /utils/userIndexedDB
*/

let IDB;

/**
@function openDB
@param {object} params 
@returns {Promise} OpenDBPromise
*/
export async function openDB(params) {
  const OpenDBPromise = new Promise((resolve, reject) => {
    // will create a new database if db/version doesn't exist.
    const IDBRequest = indexedDB.open(`${params.user}|${params.db}`, 3);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error);
      resolve(IDBRequest);
    };

    IDBRequest.onsuccess = (event) => {
      if (!event.target.result.objectStoreNames.contains(params.store)) {
        console.warn(
          `UserIDB '${params.user}|${params.db}' doesn't contain "${params.store}" objectStore.`,
        );

        IDB = null;
        resolve();
      }

      IDB = event.target.result;
      resolve();
    };

    // will be called on database versioning.
    IDBRequest.onupgradeneeded = (event) => {
      // onsuccess method will be called after the object store is created.
      event.target.result.createObjectStore(params.store, { keyPath: 'key' });
    };
  });

  await OpenDBPromise;

  return OpenDBPromise;
}

/**
@function deleteDB
*/
export async function deleteDB(params) {
  indexedDB.deleteDatabase(`${params.user}|${params.db}`);
}

/**
@function add
@param {Object} params 
@property {string} params.user 
@property {string} params.db 
@property {string} params.store 
@property {object} params.key 
@returns {Promise} addPromise
*/
export async function add(params) {
  if (!IDB) await openDB(params);

  const addPromise = new Promise((resolve, reject) => {
    const IDBTransaction = IDB.transaction([params.store], 'readwrite');

    const objectStore = IDBTransaction.objectStore(params.store);

    const IDBRequest = objectStore.add(params.obj);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error);
      resolve(IDBRequest);
    };

    IDBRequest.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });

  await addPromise;

  return addPromise;
}

/**
@function get
@param {Object} params 
@property {string} params.user 
@property {string} params.db 
@property {string} params.store 
@property {object} params.key 
@returns {Promise} getPromise
*/
export async function get(params) {
  if (!IDB) await openDB(params);

  const getPromise = new Promise((resolve, reject) => {
    const IDBTransaction = IDB.transaction([params.store], 'readwrite');

    const objectStore = IDBTransaction.objectStore(params.store);

    const IDBRequest = objectStore.get(params.key);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error);
      reject(IDBRequest);
    };

    IDBRequest.onsuccess = (event) => {
      resolve(IDBRequest.result);
    };
  });

  await getPromise;

  return getPromise;
}

/**
@function put
@param {Object} params 
@property {string} params.user 
@property {string} params.db 
@property {string} params.store 
@property {object} params.obj 
@returns {Promise} updatePromise
*/
export async function put(params) {
  if (!IDB) await openDB(params);

  const updatePromise = new Promise((resolve, reject) => {
    const IDBTransaction = IDB.transaction([params.store], 'readwrite');

    const objectStore = IDBTransaction.objectStore(params.store);

    const IDBRequest = objectStore.put(params.obj);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error);
      reject(IDBRequest);
    };

    IDBRequest.onsuccess = (event) => {
      resolve(IDBRequest.result);
    };
  });

  await updatePromise;

  return updatePromise;
}
