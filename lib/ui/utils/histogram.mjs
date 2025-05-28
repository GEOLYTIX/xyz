const histogram = {
  create,
  update,
};

/*
"dataviews": {
            "histogram": {
              "dataview": "histogram",
              "tooltip": true,
              "queryparams": {
                "field": "population",
                "table": "network_location"
              }
            }
          }
*/

export default histogram;

async function create(params) {
  const response = await requestData(params);

  if (!response) return;

  params.node = mapp.utils.html.node`<div class="histogram">`;

  createHistogram(params, response);

  params.target.append(params.node);
}

async function update(params) {
  const response = await requestData(params);

  if (!response) return;

  createHistogram(params, response);
}

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

async function requestData(params) {
  params.query ??= 'histogram';

  const queryparams = mapp.utils.queryParams(params);

  const paramString = mapp.utils.paramString(queryparams);

  params.host ??= params.layer?.mapview?.host;

  const response = await mapp.utils.xhr(
    `${params.host || mapp.host}/api/query?${paramString}`,
  );

  return response;
}
