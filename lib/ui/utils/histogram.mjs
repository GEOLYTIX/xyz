/**
## /ui/utils/histogram

The histogram ui utility

@module /ui/utils/histogram

Accessible through 
```js
mapp.ui.utils.histogram.create(params);
mapp.ui.utils.histogram.update(params);
```
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
        "options": {
            "title": "My Histogram Title",
            "caption": "My histogram caption",
            "height": 200,
            "tooltip": true,
            "ylabel": "this is vertical label"
        },
        "queryparams": {
            "field": "population",
            "table": "network_location",
            "buckets": 6, // optional, defaults to 7
            "decimals": 1 // optional, default to 0
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
  @property {HTMLElement} params.target Target element in which histogram is rendered. Aligns with dataview target.
  @property {String} params.query Histogram query. Defaults to `histogram` if not defined. 
  Histogram query requires `table` and `field` passed in queryparams object. The default query supports other 2 parameters: `buckets` which defaults to 7 and represents count of histogram buckets aparts from 2 edge buckets therefore a default histogram has a total of 9 buckets. 
  The other parameter is `decimals` defaulting to zero.  
  @param {Object} options - stores chart optional settings.
  @property {Boolean} params.options.tooltip - defaults to false. If enabled each bucket will have a tooltip with bucket properties.
  @property {Number} params.options.width - optional width in pixels for histogram container.
  @property {Number} params.options.height - optional height in pixels for histogram container.
  @property {String} params.options.title - optional title to display above.
  @property {String} params.options.caption - optional caption to display below.
  @property {String} params.options.ylabel - optional label for vertical axis.
  */
async function create(params) {
  const response = await requestData(params);

  params.node = mapp.utils.html.node`<div class="histogram">`;

  if (params.options.width)
    params.node.style.width = `${params.options.width}px`;
  if (params.options.height)
    params.node.style.height = `${params.options.height}px`;
  if (params.options.title)
    params.target.append(
      mapp.utils.html.node`<h3 class="histogram-title">${params.options.title}`,
    );

  createHistogram(params, response);

  params.target.append(params.node);

  if (params.options.xlabel) {
    const xlabel = mapp.utils.html
      .node`<div class="histogram-xlabel">${params.options.xlabel}`;
    if (params.options?.width) xlabel.style.width = `${params.options.width}px`;
    params.target.append(xlabel);
  }

  if (params.options.caption)
    params.target.append(
      mapp.utils.html
        .node`<span class="histogram-caption">${params.options.caption}`,
    );
}

/**
  @function update
  
  @description
  The function requests data and recreates the visual element.
  @param {Object} params Histogram configuration object.
  */
async function update(params) {
  const response = await requestData(params);

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
  if (!data || data instanceof Error) {
    console.warn('Histogram not created: data unavailable.');
    return;
  }
  params.node.replaceChildren();

  const maxBucketHeight = Math.max(...data.map((item) => item.count));

  // element fixed height as baseline or use 100 if unset
  const elementHeight = params.options.height || 100;

  if (params.options.ylabel) {
    params.node.append(
      mapp.utils.html.node`<div class="ylabel">${params.options.ylabel}`,
    );
  }

  for (const bucket of data) {
    const style = `
          height: ${Math.round((elementHeight * bucket.count) / maxBucketHeight)}px
          `;

    const tooltip = params.options?.tooltip
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

  if (!params.queryparams.table) {
    console.warn(`Histogram not created: table missing`);
    return;
  }

  if (!params.queryparams.field) {
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
