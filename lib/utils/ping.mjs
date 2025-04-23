/**
## /utils/ping

@module /utils/ping
*/

/**
@function ping 
@async
  
@description

@param {Object} params The parameters object.
@returns {Promise<Object|Error>} The outcome object and any messages returned by the database.

``` js
mapp.utils.ping({
  query: 'location_field_value',
  responseType: 'text',
  successCondition: 'ok',
  queryparams: {
    id: true,
    field: 'model_status',
    table: 'location_table',
  },
  interval: 3000,
  callback: (response) => {
    console.log(response);
  },
});
```
*/
export default async function ping(params) {

  if (!params.query) {
    console.warn(`A query parameter must be defined for the ping utility.`)
    return;
  }

  // Default interval to 4 seconds
  params.interval ??= 4000;
  
  params.host ??= mapp.host

  return new Promise((resolve, reject) => {

    const queryParams = mapp.utils.queryParams(params);

    const paramString = mapp.utils.paramString(queryParams);

    params.url = `${mapp.host}/api/query?${paramString}`;

    const pingQuery = async () => {

      const response = await mapp.utils.xhr(params);

      console.log(response)

      if (response instanceof Error) {

        reject(response)
        return;
      }

      if (params.callback instanceof Function) {

        params.callback(response, params)
      }

      if (params.callback === false) {

        return;
      }

      if (params.errorCondition === response) {

        reject(response)
        return;
      }

      if (params.successCondition === response) {

        resolve(response)
        return;
      }

      setTimeout(pingQuery, params.interval);
    };

    pingQuery();
  });
}
