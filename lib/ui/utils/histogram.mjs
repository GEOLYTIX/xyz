const histogram = {
  create,
  update,
};

export default histogram;

async function create(params) {
  params.query ??= 'histogram';

  const queryparams = mapp.utils.queryParams(params);

  const paramString = mapp.utils.paramString(queryparams);

  params.host ??= params.layer?.mapview?.host;

  const response = await mapp.utils.xhr(
    `${params.host || mapp.host}/api/query?${paramString}`,
  );

  const container = mapp.utils.html.node`<div class="histogram">`;

  const maxBucketHeight = Math.max(...response.map((item) => item.count));

  for (const bucket of response) {
    const style = `
        height: ${Math.round((100 * bucket.count) / maxBucketHeight)}px
        `;

    container.append(mapp.utils.html.node`<div 
        class="bucket" 
        data-bucket=${bucket.bucket} 
        data-count=${bucket.count} 
        data-bucket-min=${bucket.bucket_min}
        data-bucket-max=${bucket.bucket_max}
        style=${style}>
        <div class="bucket-info">
        <span><b>Count</b> ${bucket.count}</span><br>
        <span><b>Min</b> ${bucket.bucket_min}</span><br>
        <span><b>Max</b> ${bucket.bucket_max}</span>
        `);
  }

  params.target.append(container);
}

async function update(params) {
  console.log('hello this is histogram update');
}
