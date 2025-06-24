/**
## /ui/utils/histogram

The histogram utility module exports the histogram object with a create method to generate a histogram dataview.

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
      "ylabel": "this is vertical label",
      "xlabel": "this is horizontal label"
    },
    "queryparams": {
      "field": "population",
      "table": "network_location",
      "buckets": 6, // optional, defaults to 7
      "decimals": 1 // optional, default to 0
    }
  }
}
```

@module /ui/utils/histogram
*/

const histogram = {
  create,
};

export default histogram;

/*

*/

/**
@function create

@description
Initial creation of histogram. The function requests data based on defined query settings and creates histogram visual element.

@param {Object} params Histogram configuration object.
@property {HTMLElement} params.target Target element for the histogram node.
@property {String} [params.query='histogram'] Histogram query requires `table` and `field` passed in queryparams object. The default query supports other 2 parameters: `buckets` which defaults to 7 and represents count of histogram buckets aparts from 2 edge buckets therefore a default histogram has a total of 9 buckets. The other parameter is `decimals` defaulting to zero.
@property {Object} [params.queryparams] Parameter for histogram query request.
@property {Object} [params.options] Stores chart optional settings.
@property {Boolean} [options.tooltip] Defaults to false. If enabled each bucket will have a tooltip with bucket properties.
@property {Number} [options.width] Width in pixels for histogram container.
@property {Number} [options.height] Height in pixels for histogram container.
@property {String} [options.title] Title to display above.
@property {String} [options.caption] Caption to display below.
@property {String} [options.ylabel] Label for vertical axis.
@property {String} [options.xlabel] Label for horizontal axis.
*/
async function create(params) {
  params.query ??= 'histogram';

  params.options ??= {};

  params.node = mapp.utils.html.node`<div class="histogram">`;

  if (params.options.width) {
    params.node.style.width = `${params.options.width}px`;
  }

  if (params.options.height) {
    params.node.style.height = `${params.options.height}px`;
  }

  if (params.options.title) {
    params.target.append(
      mapp.utils.html.node`<h3 class="histogram-title">${params.options.title}`,
    );
  }

  params.setData = setData;

  params.target.append(params.node);

  if (params.options.xlabel) {
    const xlabel = mapp.utils.html
      .node`<div class="histogram-xlabel">${params.options.xlabel}`;

    if (params.options.width) {
      xlabel.style.width = `${params.options.width}px`;
    }

    params.target.append(xlabel);
  }

  if (params.options.caption) {
    params.target.append(
      mapp.utils.html
        .node`<span class="histogram-caption">${params.options.caption}`,
    );
  }
}

/**
@function setData

@description
The dataview setData method is called by the dataview update method. The data must be provided as an array of bucket object.

```json
{
    "count": 68,
    "bucket": 0,
    "bucket_min": "0",
    "bucket_max": "143"
},
{
    "count": 1166,
    "bucket": 1,
    "bucket_min": "143",
    "bucket_max": "286"
},
{
    "count": 1571,
    "bucket": 2,
    "bucket_min": "286",
    "bucket_max": "429"
}
```
@param {Array} data The histogram data.
*/
function setData(data) {
  this.data = data;

  createHistogramBuckets(this);
}

/**
@function createHistogramBuckets

@description
The method generates an array of bucket elements from the data buckets. The elements are rendered into the histogram node.
@param {Object} params Histogram configuration object.
*/
function createHistogramBuckets(params) {
  const maxBucketHeight = Math.max(...params.data.map((item) => item.count));

  params.options.height ??= 100;

  const bucketElements = params.data.map((bucket) => {
    const style = `height: ${Math.round((params.options.height * bucket.count) / maxBucketHeight)}px`;

    const tooltip = params.options.tooltip
      ? mapp.utils.html`
          <div class="bucket-info">
          <span><b>Count</b> ${bucket.count}</span><br>
          <span><b>Min</b> ${bucket.bucket_min}</span><br>
          <span><b>Max</b> ${bucket.bucket_max}</span>`
      : ``;

    return mapp.utils.html`<div
      class="bucket"
      data-bucket=${bucket.bucket}
      data-count=${bucket.count}
      data-bucket-min=${bucket.bucket_min}
      data-bucket-max=${bucket.bucket_max}
      style=${style}>
      ${tooltip}`;
  });

  const ylabel = params.options.ylabel
    ? mapp.utils.html`<div class="ylabel">${params.options.ylabel}`
    : '';

  mapp.utils.render(
    params.node,
    mapp.utils.html.node`${bucketElements}${ylabel}`,
  );
}
