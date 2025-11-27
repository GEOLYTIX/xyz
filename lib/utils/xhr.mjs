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

The method is assumed to be 'POST' if a params.body is provided.

@param {Object} params The object containing the parameters.
@property {string} params.url The request URL.
@property {string} [params.method=GET] The request method.
@property {string} [params.responseType=json] The XHR responseType.
@property {Object} [params.requestHeader={'Content-Type': 'application/json'}] The XHR requestHeader.
@property {string} [params.body] A stringified request body for a 'POST' request.
@property {boolean} [params.resolveTarget] Whether the target instead of target.response should be resolved.
@property {boolean} [params.cache] Whether the response should be cached in a Map().
@property {boolean|string} [params.throttle] Whether the response should be throttled and added to the throttle Map under a group name.

@returns {Promise} A promise that resolves with the XHR.
*/
const requestMap = new Map();
const throttleMap = new Map();

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

    const throttleKey = getThrottleKey(params);

    checkThrottle(throttleKey);

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

    setThrottle(throttleKey, xhr);

    const cleanup = () => {
      if (throttleKey !== null) throttleMap.delete(throttleKey);
    };

    xhr.onload = () => {
      cleanup();

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

    xhr.onabort = () => cleanup();

    xhr.send(params.body);
  });
}

/**
@function getThrottleKey

@param {Object} params The object containing the parameters.
@property {boolean|string} [params.throttle] Whether the response should be throttled and added to the throttle Map under a group name.

@returns {string|null} The throttle group key
*/
function getThrottleKey(params) {
  if (typeof params.throttle === 'string') {
    return params.throttle;
  } else if (params.throttle === true) {
    return 'global';
  }
}

/**
@function setThrottle

@description
Function to add throttle controller for throttle group

@param {string} throttleKey The throttle group key
@param {Object} xhr XMLHttpRequest
*/
function setThrottle(throttleKey, xhr) {
  if (throttleKey !== null) {
    const controller = {
      abort: () => {
        xhr.abort();
        throttleMap.delete(throttleKey); // Auto-cleanup
      },
    };
    throttleMap.set(throttleKey, controller);
  }
}

/**
@function checkThrottle

@description
Function to abort a previous request if it's to be throttled

@param {string} throttleKey The throttle group key
*/
function checkThrottle(throttleKey) {
  if (throttleKey !== null) {
    const previous = throttleMap.get(throttleKey);
    if (previous) {
      previous.abort(); // Abort old request
      throttleMap.delete(throttleKey);
    }
  }
}
