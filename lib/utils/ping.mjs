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

  pingQuery(params);
}

/**
@function pingQuery 
@async
  
@description
The pingQuery method will call itself with a timeout until a condition is met.

The method will shortcircuit if the query fails.

The method will shortcircuit if the callback property is set to false.

If the callback property is a function it will be called with the response and the params object itself as arguments.

The method will shortcircuit if the reponse matches either the failCondition or the successCondition.

@param {Object} params The parameters object.
@property {string} params.responseType The expected responseType form the ping query.
@property {string} params.url The request url for the ping query.
@property {function} params.callback Method to be executed with the response and params object as arguments.
*/
async function pingQuery(params) {
  const response = await mapp.utils.xhr(params);

  if (response instanceof Error) {
    return;
  }

  if (params.callback instanceof Function) {
    params.callback(response, params);
  }

  if (params.callback === false) {
    return;
  }

  if (params.failCondition === response) {
    return;
  }

  if (params.successCondition === response) {
    return;
  }

  setTimeout(() => pingQuery(params), params.interval);
}
