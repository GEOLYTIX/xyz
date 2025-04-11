/**
## /utils/ping

This module exports the default ping method for mapp utils module.

@module /utils/ping
*/

/**
  @function ping 
  @async
  
  @description
This function will ping the database running a specific query.
The query will return a response, and this response will be checked against the params.success and params.error properties.
If the response is an error, or returns the params.error value, the promise will be rejected.
If the response is successful, the promise will be resolved.
If the response is neither an error nor a success, the promise will be re-run after the params.interval time.
The response will be returned every time, so it can be shown in the UI if needed.
  
@param {Object} params The parameters object.
@property {Number} [params.interval] The interval in milliseconds to wait before retrying the ping. Default is 3000ms.
@property {Object} [params.stages] The stages object containing success and error properties.
@property {String} [params.stages.success] The success stage value. Default is 'Complete'.
@property {String} [params.stages.error] The error stage value. Default is 'Error'.
@property {String} [params.stages.field] The field that is returned in the query. Default is 'model_status'.
@property {String} [params.query] The query to run for the ping. Default is 'ping_status'. Note the default query requires a field, table and id to be set in the queryparams object.
@property {Object} [params.returnStatus] If set to true, the ping stage will be returned in the callback function. This allows the ping stage to be shown in the UI.
  @returns {Promise<Object|Error>} The outcome object and any messages returned by the database.

``` js
mapp.utils.ping({
    query: 'location_field_value',
    queryparams: {
        id: true,
        field: 'model_status',
        table: 'location_table',
    },
    interval: 3000,
    stages: {
        success: 'Complete',
        error: 'Error',
    },
    returnStatus: true,
    callback: (pingStage) => {
        console.log('Ping stage:', pingStage);
    },
    });
```
  */
// Create the ping function
export default async function ping(params) {
  return new Promise((resolve, reject) => {
    // Default interval to 3 seconds
    params.interval ??= 3000;

    // Default stages to an object with success and error properties
    params.stages ??= {
      success: 'Complete',
      error: 'Error',
    };

    // Default query to location_field_value if not provided
    params.query ??= 'location_field_value';

    // Default queryparams to an empty object if not provided
    params.queryparams ??= {};

    const qparams = params.queryparams;

    qparams.query = params.query;

    const checkStatus = async () => {
      const paramString = mapp.utils.paramString(qparams);
      const url = `${mapp.host}/api/query?${paramString}`;

      const pingResp = await mapp.utils.xhr(url);

      const pingStage = pingResp?.[params.field] || 'Initialising';

      // Return the ping stage if returnStatus is true so that it can be used in the UI
      if (
        params.returnStatus === true &&
        typeof params.callback === 'function'
      ) {
        params.callback(pingStage);
      }

      // If the ping stage is success, resolve the promise
      if (pingStage === params.stages.success) {
        resolve();
        return;
      }

      // If the ping stage is set to the error value, or the pingResp is an error, reject the promise
      if (pingStage === params.stages.error || pingResp instanceof Error) {
        // Handle error case
        console.error('Error:', pingResp);
        reject(new Error('Ping failed'));
        return;
      }

      // Retry after the specified interval
      setTimeout(checkStatus, params.interval);
    };

    // Start checking status
    checkStatus();
  });
}
