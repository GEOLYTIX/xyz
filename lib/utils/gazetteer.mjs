/**
## mapp.utils.gazetteer{}

The gazetteer is used to search for locations via a provider or by searching for matching terms in a database.

A provider can be supplied to search e.g. Google
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
      // Merge the gazetteer and dataset objects
      // Ensuring that the dataset takes precedence over the gazetteer
      ...gazetteer,
      ...dataset,
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
    filter: layer.filter?.current,
    label: dataset.label || dataset.qterm,
    layer: layer.key,
    limit: dataset.limit || 10,
    locale: dataset.mapview.locale.key,
    qID: layer.qID,
    qterm: dataset.qterm,
    table: dataset.table || layer.table,
    template: dataset.query || 'gaz_query',
    term: `${dataset.leading_wildcard ? '*' : ''}${term}*`,
    wildcard: '*',
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
Adds any search results to a list to be displayed in the view.

Uses {@link module:/location/get} to add a location to search results so they can be
shown on click.

@param {Object} dataset The configuraion object from which the search is being conducted.
@param {Object} layer The layer on which the result is found.
@param {Object} row the returned data.
*/
function addRow(dataset, layer, row) {
  const listRow = mapp.utils.html.node`<li
    onclick=${(e) => {
      if (dataset.callback) return dataset.callback(row, dataset);

      mapp.location
        .get({
          id: row.id,
          layer,
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

Will display a warning if the returned location is outside the extent.

@param {Object} location The configuraion object from which the search is being conducted.
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
    hook: location.label,
    Layers: [],
    Extents: {},
    layer: {
      mapview: gazetteer.mapview,
    },
  });

  const infoj = [
    {
      inline: true,
      title: location.label,
      value: location.source,
    },
    {
      class: 'display-none',
      location,
      srid: '4326',
      type: 'pin',
      value: [location.lng, location.lat],
      buffer: gazetteer.buffer,
    },
  ];

  mapp.location.decorate(Object.assign(location, { infoj }));

  gazetteer.mapview.locations[location.hook] = location;

  location.flyTo(gazetteer.maxZoom);
}
