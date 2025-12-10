/**
## /utils/xhr

Export the xhr method to mapp.utils{}.

@module /utils/xhr
*/

/**
@function xhr

@description
The params object/string for the xhr utility method is required.

The params are assumed to the request URL if provided as a string argument.

The request params and response are stored in a Map() if the cache flag is set in the params object argument.

If the throttle flag is set we will abort requests that have not been resolved yet if there is an incoming request that is part of the same group
This flag is optional and will only be set in scenarios where requests could happen in quick succession but are not necessary.

If the debounce flag is set, requests will be delayed until after the specified time has elapsed since the last call in the same group.
Unlike throttle which aborts previous requests, debounce delays execution of the latest request.

The method is assumed to be 'POST' if a params.body is provided.

@param {Object} params The object containing the parameters.
@property {string} params.url The request URL.
@property {string} [params.method=GET] The request method.
@property {string} [params.responseType=json] The XHR responseType.
@property {Object} [params.requestHeader={'Content-Type': 'application/json'}] The XHR requestHeader.
@property {string} [params.body] A stringified request body for a 'POST' request.
@property {boolean} [params.resolveTarget] Whether the target instead of target.response should be resolved.
@property {boolean} [params.cache] Whether the response should be cached in a Map().
@property {boolean|number|string} [params.debounce] Whether the request should be debounced. Can be true (300ms default), a number (milliseconds), or a string (group name with 300ms default). Format: "groupName:milliseconds" or just "groupName".

@returns {Promise} A promise that resolves with the XHR.
*/
const requestMap = new Map();
const debounceMap = new Map();

export function xhr(params) {
  return new Promise((resolve, reject) => {
    if (!params) {
      console.error('xhr params are falsy.');
      return reject(new Error('xhr params are required'));
    }

    params = typeof params === 'string' ? { url: params } : { ...params };

    if (!params.url) {
      console.error('no xhr request url has been provided.');
      return reject(new Error('no xhr request url has been provided.'));
    }

    const debounceConfig = getDebounceConfig(params);

    if (debounceConfig) {
      return handleDebounce(params, debounceConfig, resolve, reject);
    }

    params.method ??= params.body ? 'POST' : 'GET';
    params.responseType ??= 'json';

    const xhr = new XMLHttpRequest();
    xhr.open(params.method, params.url, true);

    if (params.requestHeader !== null) {
      const headers = {
        'Content-Type': 'application/json',
        ...params.requestHeader,
      };
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    }

    xhr.responseType = params.responseType;

    if (params.cache && requestMap.has(params.url)) {
      const cached = requestMap.get(params.url);
      return resolve(params.resolveTarget ? cached : cached.response);
    }

    xhr.onload = () => {
      if (params.onLoad?.() === false) return;

      if (xhr.status >= 400) {
        return reject(new Error(`HTTP ${xhr.status}`));
      }

      const result = params.resolveTarget ? xhr : xhr.response;

      if (params.cache) {
        requestMap.set(
          params.url,
          params.resolveTarget ? xhr : { response: result },
        );
      }

      resolve(result);
    };

    xhr.send(params.body);
  });
}

/**
@function getDebounceConfig

@description
Parse the debounce parameter and return configuration object

@param {Object} params The object containing the parameters.
@property {boolean|number|string} [params.debounce] The debounce configuration

@returns {Object|null} The debounce configuration with key and delay, or null if not debounced
*/
function getDebounceConfig(params) {
  if (!params.debounce) {
    return null;
  }

  const DEFAULT_DELAY = 300;

  if (typeof params.debounce === 'number') {
    return { key: 'global', delay: params.debounce };
  }

  if (params.debounce === true) {
    return { key: 'global', delay: DEFAULT_DELAY };
  }

  if (typeof params.debounce === 'string') {
    const parts = params.debounce.split(':');
    const key = parts[0];
    const delay = parts[1] ? Number.parseInt(parts[1], 10) : DEFAULT_DELAY;
    return { key, delay };
  }

  return null;
}

/**
@function handleDebounce

@description
Handle debounced requests by clearing previous timeouts and setting new ones

@param {Object} params The xhr parameters
@param {Object} config The debounce configuration
@param {Function} resolve The promise resolve function
@param {Function} reject The promise reject function
*/
function handleDebounce(params, config, resolve, reject) {
  const { key, delay } = config;

  const existing = debounceMap.get(key);
  if (existing) {
    clearTimeout(existing.timeoutId);
  }

  const timeoutId = setTimeout(() => {
    debounceMap.delete(key);

    xhr({ ...params, debounce: false })
      .then(resolve)
      .catch(reject);
  }, delay);

  debounceMap.set(key, { timeoutId, reject });
}
