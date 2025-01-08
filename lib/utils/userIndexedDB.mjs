/** 
 * ### mapp.utils.userIndexedDB
 * This [indexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology) implementation allows to store, get, and update a locale object from the 'locales' object store in a user indexedDB.
 * 
 * There are many different operations that the indexedDB can handle. Typically the operations are CRUD.
 * 
 * The `userIndexDB` methods have all been moved to the `mapp.utils` object.
 * 
 * The logic for initialisation for the userIndexedDB object is the following:
 * - `userIndexedDB.open(store)` will open a DB with the following name `${mapp.user.email} - {mapp.user.title}.
 * - The database will not be created if there is a pre-existing DB. 
 * - The creation will trigger the `onupgradeneeded` event which checks whether the request `store` exists in the userIndexedDB.
 * 
 * The `env.TITLE` will be added to the user object in the cookie module.
 * The `user.title` is required to generate a unique indexedDB for each user[email/instance[title]]
 * 
 * All object stores use the key value as a keypath for object indicies.
 * 
 * Adding the url parameter `useridb=true` will ask the default script to get the keyed locale from the user indexedDB. 
 * The userLocale will be assigned as locale if available.
 * 
 * ```js
 *   if (mapp.hooks.current.useridb) {

    let userLocale = await mapp.utils.userIndexedDB.get('locales', locale.key)

    if (!userLocale) {
      await mapp.utils.userIndexedDB.add('locales', locale)
    } else {
      locale = userLocale
    }
  }
 * ```
 *
 * The userIDB plugin adds a button to put [update] the locale in the user indexedDB.
 * 
 * ```js
 * export function userIDB(plugin, mapview) {

  // Find the btnColumn element.
  const btnColumn = document.getElementById('mapButton');

  if (!btnColumn) return;

  // Append the plugin btn to the btnColumn.
  btnColumn.append(mapp.utils.html.node`
    <button
      title="Update userIDB locale"
      onclick=${()=>{

        mapp.utils.userIndexedDB.put('locales', mapview.locale)

      }}>
      <div class="mask-icon" style="mask-image:url(https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/rule_settings/default/24px.svg)">`);
}
 * ```
 * This can be tested but updating the mapview.locale in another plugin, e.g. dark_mode
 * 
 * The enabled status will be stored with the local applying the setting when the locale is loaded with the useridb=true url param.
 * 
 * ```js
 * mapp.plugins.dark_mode = (plugin, mapview) => {

  // Get the map button
  const mapButton = document.getElementById("mapButton");

  // If mapbutton doesn't exist, return (for custom views).
  if (!mapButton) return;

  // toggle dark_mode if enabled in config.
  mapview.locale.dark_mode.enabled && toggleDarkMode()

  // If the button container exists, append the dark mode button.
  mapButton.append(mapp.utils.html.node`
    <button
      title="Color Mode"
      class="btn-color-mode"
      onclick=${()=>{
        mapview.locale.dark_mode.enabled = toggleDarkMode()
      }}>
      <div class="mask-icon">`);
}
 * ```
 *  
 * @module /utils/userIndexedDB
 */

let IDB

/**
 * @param {Object} store 
 * @returns {Promise} OpenDBPromise
 */
export async function openDB(_store) {

  const store = _store.toString()

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
      event.target.result.createObjectStore(store, { keyPath: 'key' });
    };
  })

  await OpenDBPromise

  return OpenDBPromise
}

/**
 * - deletes the user indexedDB.
 * @function deleteDB
 */ 
export function deleteDB() {

  if (!mapp.user) return;

  indexedDB.deleteDatabase(`${mapp.user.email} - ${mapp.user.title}`)

  console.log('Database deleted')
}

/**
 * - Adds the keyed object to the named store.
 * - The key will be returned on success. 
 * - Adding the same keyed object twice will result in an error.
 * @function add
 * @param {Object} store 
 * @param {Object} obj 
 * @returns {Promise} addPromise
 */
export async function add(store, obj) {

  if (!IDB) await openDB(store)

  const addPromise = new Promise((resolve, reject) => {

    const IDBTransaction = IDB.transaction([store], 'readwrite');

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

/**
 * - Gets the keyed object from the named store.
 * @param {Object} store 
 * @param {string} key 
 * @returns {Promise} getPromise
 */
export async function get(store, key) {

  if (!IDB) await openDB(store)

  const getPromise = new Promise((resolve, reject) => {

    const IDBTransaction = IDB.transaction([store], 'readwrite');

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

/**
 * - puts the keyed object to the named store. 
 * - This will override the existing keyed object. 
 * - Updates work by replacing (put) the same keyed object into an user indexedDB.
 * @param {Object} store 
 * @param {Object} obj 
 * @returns {Promise} updatePromise
 */
export async function put(store, obj) {

  if (!IDB) await openDB(store)

  const updatePromise = new Promise((resolve, reject) => {

    const IDBTransaction = IDB.transaction([store], 'readwrite');

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
