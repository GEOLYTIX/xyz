/**
## mapp.utils.gazetteer{}

Dictionary entries:
- no_results
- invalid_lat_lon
@requires /dictionary 

@module /utils/gazetteer
*/

export function datasets(term, gazetteer) {
  if (!gazetteer.provider) {
    // The default gazetteer config is for a dataset search.
    // Abort current dataset query. Onload will not be called.
    // gazetteer.xhr?.abort();
    // gazetteer.xhr = new XMLHttpRequest();
    gazetteer.qterm && search(term, gazetteer);
  }

  // Search additional datasets.
  gazetteer.datasets?.forEach((dataset) => {
    // Abort current dataset query. Onload will not be called.
    // dataset.xhr?.abort();
    // dataset.xhr = new XMLHttpRequest();

    Object.assign(dataset, {
      ...gazetteer,
      layer: gazetteer.layer,
      table: gazetteer.table,
      query: gazetteer.query,
      qterm: gazetteer.qterm,
      label: gazetteer.label,
      title: gazetteer.title,
      limit: gazetteer.limit,
      no_result: gazetteer.no_result,
      leading_wildcard: gazetteer.leading_wildcard,
      callback: gazetteer.callback,
      maxZoom: gazetteer.maxZoom,
    });

    search(term, dataset);
  });
}

function search(term, dataset) {
  console.log(dataset);
  const layer = dataset.mapview.layers[dataset.layer];

  // Skip if layer defined in datasets is not added to the mapview
  if (!layer) {
    console.warn('No layer definition for gazetteer search.');
    return;
  }

  // Skip if layer table is not defined and no table is defined in dataset or gazetteer.
  if (!layer.table && !dataset.table) {
    console.warn('No table definition for gazetteer search.');
    return;
  }

  const paramString = mapp.utils.paramString({
    template: dataset.query || 'gaz_query',
    label: dataset.label || dataset.qterm,
    qterm: dataset.qterm,
    qID: layer.qID,
    locale: dataset.mapview.locale.key,
    layer: layer.key,
    filter: layer.filter?.current,
    table: dataset.table || layer.table,
    wildcard: '*',
    term: `${dataset.leading_wildcard ? '*' : ''}${term}*`,
    limit: dataset.limit || 10,
  });

  dataset.url = `${dataset.mapview.host}/api/query?${paramString}`;
  // dataset.xhr.open(
  //   'GET',
  //   dataset.mapview.host +
  //     '/api/query?' +
  //     mapp.utils.paramString({
  //       template: dataset.query || 'gaz_query',
  //       label: dataset.label || dataset.qterm,
  //       qterm: dataset.qterm,
  //       qID: layer.qID,
  //       locale: dataset.mapview.locale.key,
  //       layer: layer.key,
  //       filter: layer.filter?.current,
  //       table: dataset.table || layer.table,
  //       wildcard: '*',
  //       term: `${dataset.leading_wildcard ? '*' : ''}${term}*`,
  //       limit: dataset.limit || 10,
  //     }),
  // );

  // dataset.xhr.setRequestHeader('Content-Type', 'application/json');
  // dataset.xhr.responseType = 'json';
  dataset.onLoad = (e) => {
    // The gazetteer input may have been cleared prior to the onload event.
    if (!dataset.input.value.length) return;

    if (e.target.status >= 300) return;

    // No results
    if (!e.target.response) {
      if (dataset.no_result === null) return;
      dataset.list.append(mapp.utils.html.node`
        <li>
          <span class="label">${dataset.title || layer.name}</span>
          <span>${dataset.no_result || mapp.dictionary.no_results}</span>`);
      return;
    }

    // Ensure that response if a flat array.
    [e.target.response].flat().forEach((row) => addRow(dataset, layer, row));
  };

  mapp.utils.xhr(dataset);
  //dataset.xhr.send();
}

function addRow(dataset, layer, row) {
  const listRow = mapp.utils.html.node`<li 
    onclick=${(e) => {
      if (dataset.callback) return dataset.callback(row, dataset);

      mapp.location
        .get({
          layer,
          id: row.id,
        })
        .then((loc) => loc?.flyTo?.(dataset.maxZoom));
    }}>
    <span class="label">${dataset.title || layer.name}</span>
    <span>${row.label}</span>`;

  dataset.list.append(listRow);
}

export function getLocation(location, gazetteer) {
  if (typeof gazetteer.callback === 'function') {
    gazetteer.callback(location);
    return;
  }

  const coord = ol.proj.transform(
    [location.lng, location.lat],
    `EPSG:4326`,
    `EPSG:${gazetteer.mapview.srid}`,
  );

  if (!ol.extent.containsCoordinate(gazetteer.mapview.extent, coord)) {
    alert(mapp.dictionary.invalid_lat_lon);
    return;
  }

  Object.assign(location, {
    layer: {
      mapview: gazetteer.mapview,
    },
    Layers: [],
    hook: location.label,
  });

  const infoj = [
    {
      title: location.label,
      value: location.source,
      inline: true,
    },
    {
      type: 'pin',
      value: [location.lng, location.lat],
      srid: '4326',
      class: 'display-none',
      location,
    },
  ];

  mapp.location.decorate(Object.assign(location, { infoj }));

  gazetteer.mapview.locations[location.hook] = location;

  location.flyTo(gazetteer.maxZoom);
}
