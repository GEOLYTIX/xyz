/**
## /utils/ping

The ping utility module exports a method to repeat a ping query until a condition is met.

@module /utils/ping
*/

/**
@function ping 
  
@description
The ping utility method executes the pingQuery method which will repeat at a given interval until a condition is met.

The ping method will create a request url for the ping query from the provided queryparams object.

``` js
mapp.utils.ping({
  query: 'location_field_value',
  responseType: 'text',
  successCondition: 'ok',
  failCondition: 'failed',
  queryparams: {
    id: true,
    field: 'model_status',
    table: 'location_table',
  },
  interval: 4000,
  callback: (response) => {
    console.log(response);
  },
});
```

@param {Object} params The parameters object.
@property {string} params.query The query template for the ping query.
@property {Object} params.queryparams Parameters for the ping query.
*/
export default function ping(params) {
  if (!params.query) {
    console.warn(`A query parameter must be defined for the ping utility.`);
    return;
  }

  // Default interval to 4 seconds
  params.interval ??= 4000;

  params.host ??= mapp.host;

  const queryParams = mapp.utils.queryParams(params);

  const paramString = mapp.utils.paramString(queryParams);

  params.url = `${mapp.host}/api/query?${paramString}`;

  return pingQuery(params);
}

/** 
@function pingQuery 
  
@description
The pingQuery method will call itself with a timeout until a condition is met.

The method will reject if the response is an error.

The method will resolve if the response matches either the failCondition or the successCondition.

The method will resolve if the callback property is set to false.

If the callback property is a function it will be called with the response and the params object itself as arguments.

@param {Object} params The parameters object.
@property {string} params.responseType The expected responseType form the ping query.
@property {string} params.url The request url for the ping query.
@property {function} params.callback Method to be executed with the response and params object as arguments.
@property {string} params.successCondition The expected response for a successful ping query.
@property {string} params.failCondition The expected response for a failed ping query.
@property {number} params.interval The interval in milliseconds between ping queries.
@returns {Promise} A promise that resolves with the response or rejects with an error.
*/
function pingQuery(params) {
  return new Promise((resolve, reject) => {
    const pingPromise = async () => {
      const response = await mapp.utils.xhr(params);

      if (response instanceof Error) {
        return reject(response);
      }

      if (params.callback instanceof Function) {
        params.callback(response, params);
      }

      if (params.callback === false) {
        return resolve(response);
      }

      if (params.failCondition === response) {
        return resolve(response);
      }

      if (params.successCondition === response) {
        return resolve(response);
      }

      setTimeout(pingPromise, params.interval);
    };

    pingPromise();
  });
}
