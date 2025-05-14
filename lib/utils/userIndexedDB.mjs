/** 
### mapp.utils.userIndexedDB

The module exports method to store and retrieve objects from a userIndexedDB.

@module /utils/userIndexedDB
*/

/**
@function openDB
@description
The method is called from any transaction method to interact with the userIndexedDB.

A new database will be created when attempting to open a DB which does not exist.

A new store will be created when a new DB is upgraded [on creation].

@param {object} params 
@property {string} params.store
@property {string} params.user
@property {string} params.workspace
@returns {Promise} OpenDBPromise
*/
export async function openDB(params) {
  const OpenDBPromise = new Promise((resolve, reject) => {
    params.indexedDB ??= 'MAPP';
    // will create a new database if db/version doesn't exist.
    const IDBRequest = indexedDB.open(params.indexedDB, 3);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error);
      resolve(IDBRequest);
    };

    IDBRequest.onsuccess = (event) => {
      if (!event.target.result.objectStoreNames.contains(params.store)) {
        console.warn(
          `UserIDB '${params.indexedDB}' doesn't contain "${params.store}" objectStore.`,
        );

        resolve(null);
      }

      resolve(event.target.result);
    };

    // will be called on database versioning.
    IDBRequest.onupgradeneeded = (event) => {
      // onsuccess method will be called after the object store is created.
      event.target.result.createObjectStore(params.store);
    };
  });

  const IDB = await OpenDBPromise;

  return IDB;
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
  const IDB = await openDB(params);

  const addPromise = new Promise((resolve, reject) => {
    const IDBTransaction = IDB.transaction([params.store], 'readwrite');

    const objectStore = IDBTransaction.objectStore(params.store);

    const IDBRequest = objectStore.add(params.obj);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error);
      reject(IDBRequest.error);
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
@property {string} params.workspace 
@property {string} params.store 
@property {object} params.name 
@returns {Promise} getPromise
*/
export async function get(params) {
  const IDB = await openDB(params);

  const getPromise = new Promise((resolve, reject) => {
    const IDBTransaction = IDB.transaction([params.store], 'readwrite');

    const objectStore = IDBTransaction.objectStore(params.store);

    const IDBRequest = objectStore.get(params.name);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error);
      reject(IDBRequest.error);
    };

    IDBRequest.onsuccess = (event) => {
      resolve(IDBRequest.result);
    };
  });

  await getPromise;

  return getPromise;
}

export async function list(params) {
  const IDB = await openDB(params);

  const getPromise = new Promise((resolve, reject) => {
    const IDBTransaction = IDB.transaction([params.store], 'readwrite');

    const objectStore = IDBTransaction.objectStore(params.store);

    const IDBRequest = objectStore.getAll();

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error);
      reject(IDBRequest);
    };

    IDBRequest.onsuccess = (event) => {
      const locales = IDBRequest.result.map((locale) => ({
        key: locale.key,
        name: locale.name,
      }));
      resolve(locales);
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
  const IDB = await openDB(params);

  const updatePromise = new Promise((resolve, reject) => {
    const IDBTransaction = IDB.transaction([params.store], 'readwrite');

    const objectStore = IDBTransaction.objectStore(params.store);

    const IDBRequest = objectStore.put(params.obj, params.name);

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

export async function remove(params) {
  const IDB = await openDB(params);

  const removePromise = new Promise((resolve, reject) => {
    const IDBTransaction = IDB.transaction([params.store], 'readwrite');

    const objectStore = IDBTransaction.objectStore(params.store);

    const IDBRequest = objectStore.delete(params.name);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error);
      reject(IDBRequest);
    };

    IDBRequest.onsuccess = (event) => {
      resolve();
    };
  });

  await removePromise;

  return removePromise;
}
