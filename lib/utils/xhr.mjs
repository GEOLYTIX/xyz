/**
## /utils/xhr

Export the default xhr method to mapp.utils{}.

@module /utils/xhr
*/

/**
@function xhr

@description
The params object/string for the xhr utility method is required.

The params are assumed to the request URL if provided as a string argument.

The request params and response are stored in a Map() if the cache flag is set in the params object argument.

The method is assumed to be 'POST' if a params.body is provided.

@param {Object} params The object containing the parameters.
@property {string} params.url The request URL.
@property {string} [params.method=GET] The request method.
@property {string} [params.responseType=json] The XHR responseType.
@property {Object} [params.requestHeader={'Content-Type': 'application/json'}] The XHR requestHeader.
@property {string} [params.body] A stringified request body for a 'POST' request.
@property {boolean} [params.resolveTarget] Whether the target instead of target.response should be resolved.
@property {boolean} [params.cache] Whether the response should be cached in a Map().

@returns {Promise} A promise that resolves with the XHR.
*/
const requestMap = new Map();

export function xhr(params) {
  return new Promise((resolve) => {
    // Return if params are falsy.
    if (!params) {
      console.error(`xhr params are falsy.`);
      return;
    }

    params.xhr?.abort();

    // Set params as object with url from string.
    params = typeof params === 'string' ? { url: params } : params;

    // A request url must be provided.
    if (!params.url) {
      console.error(`no xhr request url has been provided.`);
      return;
    }

    // Check whether a request with the same params has already been resolved.
    if (params.cache && requestMap.has(params))
      return resolve(requestMap.get(params));

    // Assign 'GET' as default method if no body is provided.
    params.method ??= params.body ? 'POST' : 'GET';

    params.xhr ??= new XMLHttpRequest();

    params.xhr.open(params.method, params.url);

    // Use requestHeader: null to prevent assignment of requestHeader.
    if (params.requestHeader !== null) {
      // Butter (spread) over requestHeader.
      const requestHeader = {
        'Content-Type': 'application/json',
        ...params.requestHeader,
      };

      Object.entries(requestHeader).forEach((entry) =>
        params.xhr.setRequestHeader(...entry),
      );
    }

    params.xhr.responseType = params.responseType || 'json';

    params.xhr.onload = (e) => {
      if (params?.onLoad) return params.onLoad?.(e);

      if (e.target.status >= 400) {
        resolve(new Error(e.target.status));
        return;
      }

      // Cache the response in the requestMap
      params.cache && requestMap.set(params, e.target.response);

      resolve(params.resolveTarget ? e.target : e.target.response);
    };

    params.xhr.onerror = (e) => resolve(new Error(e));

    params.xhr.send(params.body);
  });
}
