/**
## mapp.utils.gazetteer{}

The gazetteer is used to search for locations via a provider or by searching for matching terms in a database.

A provider can be suplpied to search e.g. Google
```
{
  "provider": "GOOGLE",
  "maxZoom": 10,
  "streetview": {
    "key": "xxxxxxxxxxxxxxxxxxxx"
  },
  "options": {
    "componentRestrictions": {
      "country": "country code"
    }
  }
}
```

This search will use google services and not interact with the database, if `datasets` are provided the search
will also look through the database:
```
"datasets": [
  {
    "qterm": "postcode",
    "title": "Postcode",
    "layer": "retailpoints"
  }
]
```

To search only the database only a smaller config can be provided:
```
"gazetteer": {
  "layer": "scratch",
  "qterm": "store_name",
  "table": "scratch"
},
```

Dictionary entries:
- no_results
- invalid_lat_lon
@requires /dictionary 

@module /utils/gazetteer
*/

/**
@function datasets

@description
Calls the search function in cases where the gazetteer was not provided with datasets. 

@param {string} term The search term from the input
@param {Object} gazetteer gazetteer configuration object.
@property {String} [gazetteer.provider] Provider for the search e.g. Google.
@property {String} [gazetteer.qterm] A database field to search for the term.
*/
export function datasets(term, gazetteer) {
  if (!gazetteer.provider) {
    gazetteer.qterm && search(term, gazetteer);
  }

  // Search additional datasets.
  gazetteer.datasets?.forEach((dataset) => {
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

/**
@function search

@description
Performs the search using the provided dataset and term.

Provides a custom onLoad function for xhr utils which adds the found rows to the result set shown in the view.

@param {string} term The search term from the input
@param {Object} dataset The parameters for the search.
*/
function search(term, dataset) {
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
}

/**
@function addRow

@description
Adds any search results to a lsit to be displayed in the view.

Uses {@link module:/location/get} to add a location to search results so they can be
shown on click.

@param {Object} dataset The configuraion object from which the search is bening conducted.
@param {Object} layer The layer on which the result is found.
@param {Object} row the returned data.
*/
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

/**
@function getLocation

@description
Turns latitude and longitude parameters into a location.

Will display a warning if the returned location is outsiode the extent.

@param {Object} location The configuraion object from which the search is bening conducted.
@property {Number} location.lng The longitude of the location.
@property {Number} location.lat The latitude of the location.
@property {Function} location.flyTo {@link module:/location/flyTo} is used to go to a location.
@param {Object} gazetteer The layer on which the result is found.

*/
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
