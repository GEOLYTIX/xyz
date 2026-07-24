/**
### /utils/userIndexedDB

The module exports methods to store and retrieve objects from a userIndexedDB.

@module /utils/userIndexedDB
*/

/**
@function openDB
@description
The method is called from any transaction method to interact with the userIndexedDB.

A new database will be created when attempting to open a DB which does not exist.

The name for the userIndexedDB database can be set with the `indexedDB` parameter or will default to the `mapp.user.title` property or "MAPP" if the user title is not defined. This is to ensure that different XYZ environments running on the same host will have separate userIndexedDB databases.

A new store will be created when a new DB is upgraded [on creation].

@param {object} params
@param {integer} [version=3] The version number for the userIndexedDB. Incremented when a new store needs to be created.
@property {string} params.store The name of the object store to interact with.
@property {string} [params.indexedDB="MAPP"] The name of the userIndexedDB database to open.
@returns {Promise} OpenDBPromise
*/
export async function openDB(params, version = 3) {
  params.indexedDB ??= mapp.user?.title || 'MAPP';

  const dbs = await indexedDB.databases();

  const db = dbs.find((db) => db.name === params.indexedDB);

  if (db?.version > version) {
    // The version must not exceed the current version of the database, otherwise an error will be thrown and the database will not be opened.
    version = db.version;
  }

  const OpenDBPromise = new Promise(async (resolve, reject) => {
    // will create a new database if db/version doesn't exist.
    const IDBRequest = indexedDB.open(params.indexedDB, version);

    IDBRequest.onerror = (event) => {
      console.error(IDBRequest.error);
      resolve(IDBRequest);
    };

    IDBRequest.onsuccess = (event) => {
      if (!event.target.result.objectStoreNames.contains(params.store)) {
        // Increment the version number to trigger onupgradeneeded and create the new store.
        return openDB(params, db.version + 1);

        // event.target.result.createObjectStore(params.store);
      } else {
        resolve(event.target.result);
      }
    };

    // will be called on database versioning. 10941 user
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
@description
The add method will add new records to the userIndexedDB.

@param {Object} params
@property {string} params.store Identifier for the object store in the userIndexedDB.
@property {object} params.obj Object to be stored in the userIndexedDB store.
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
@description
The get method will retrieve records from the userIndexedDB.
@param {Object} params 10941 user
@property {string} params.store Identifier for the object store in the userIndexedDB.
@property {object} params.name The key of the record to retrieve.
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

/**
@function list
@description
The list method will retrieve all records from the userIndexedDB store.

@param {Object} params
@property {string} params.store Identifier for the object store in the userIndexedDB.
@returns {Promise} getPromise
*/
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
      const records = IDBRequest.result.map((record) => ({
        key: record.key,
        name: record.name,
      }));
      resolve(records);
    };
  });

  await getPromise;

  return getPromise;
}

/**
@function put
@description
The put method will update existing records or add new records to the userIndexedDB.

@param {Object} params
@property {string} params.name The key of the record to update or add.
@property {string} params.store The name of the object store in the userIndexedDB.
@property {object} params.obj The object to be stored in the userIndexedDB store.
@returns {Promise} updatePromise
*/
export async function put(params) {
  if (params.store === 'user') {
    delete params.obj.admin;
    delete params.obj.roles;
    delete params.obj.blocked;
  }

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

/**
@function remove
@description
The remove method will delete records from the userIndexedDB.

@param {Object} params
@property {string} params.name The key of the record to remove.
@property {string} params.store The name of the object store in the userIndexedDB.
@returns {Promise} removePromise
*/
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
