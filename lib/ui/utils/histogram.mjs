/**
## /ui/utils/histogram

The histogram ui utility

@module /ui/utils/histogram
*/

const histogram = {
  create,
  update,
};

export default histogram;

/*
// Definition of a histogram dataview within layer
```json
"dataviews": {
    "Histogram": {
        "dataview": "histogram",
        "tooltip": true,
        "queryparams": {
            "field": "population",
            "table": "network_location"
        }
    }
}```
*/

/**
  @function create
  
  @description
  Initial creation of histogram. The function requests data based on defined query settings and creates 
  histogram visual element.
  @param {Object} params Histogram configuration object.
  @property {string} params.dataview The type of dataview, expected value is `histogram`.
  @property {HTMLElement} params.target Target element in which histogram is rendered.
  @property {String} params.query Histogram query. Defaults to `histogram` if not defined. Histogram query requires `table` and `field` passed in queryparams object.
  @property {Boolean} params.tooltip - defaults to false. If enabled each bucket will have a tooltip with bucket properties.
  */
async function create(params) {
  const response = await requestData(params);

  if (!response) return;

  params.node = mapp.utils.html.node`<div class="histogram">`;

  createHistogram(params, response);

  params.target.append(params.node);
}

/**
  @function update
  
  @description
  The function requests data and recreates the visual element.
  @param {Object} params Histogram configuration object.
  */
async function update(params) {
  const response = await requestData(params);

  if (!response) return;

  createHistogram(params, response);
}

/**
  @function createHistogram
  
  @description
  The function creates the visual element. It is called in both create and update functions.
  @param {Object} params Histogram configuration object.
  @param {Object} data Histogram data
  */
function createHistogram(params, data) {
  params.node.replaceChildren();

  const maxBucketHeight = Math.max(...data.map((item) => item.count));

  for (const bucket of data) {
    const style = `
          height: ${Math.round((100 * bucket.count) / maxBucketHeight)}px
          `;

    const tooltip = params.tooltip
      ? mapp.utils.html`
          <div class="bucket-info">
          <span><b>Count</b> ${bucket.count}</span><br>
          <span><b>Min</b> ${bucket.bucket_min}</span><br>
          <span><b>Max</b> ${bucket.bucket_max}</span>`
      : ``;

    params.node.append(mapp.utils.html.node`<div 
          class="bucket" 
          data-bucket=${bucket.bucket} 
          data-count=${bucket.count} 
          data-bucket-min=${bucket.bucket_min}
          data-bucket-max=${bucket.bucket_max}
          style=${style}>
          ${tooltip}`);
  }
}

/**
  @function requestData
  
  @description
  The function retrieves data for histogram based on query parameters. Called by both create and update functions.
  @param {Object} params Histogram configuration object.
  */
async function requestData(params) {
  params.query ??= 'histogram';

  if (params.queryparams.table) {
    console.warn(`Histogram not created: table missing`);
    return;
  }

  if (params.queryparams.field) {
    console.warn(`Histogram not created: field missing`);
    return;
  }

  const queryparams = mapp.utils.queryParams(params);

  const paramString = mapp.utils.paramString(queryparams);

  params.host ??= mapp.host;

  const response = await mapp.utils.xhr(
    `${params.host || mapp.host}/api/query?${paramString}`,
  );

  return response;
}
