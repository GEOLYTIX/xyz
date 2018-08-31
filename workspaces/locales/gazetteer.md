# Gazetteer



```text

"gazetteer": {
  "provider": "MAPBOX",
  "placeholder": "e.g. London",
  "datasets": [
    {
      "layer": "sprawls",
      "table": "glx_cities_of_the_world",
      "label": "nameascii",
      "leading_wildcard": true
    }
  ]
},
```

The gazetteer to be used for a locale. The gazeetteer inputs will be hidden on the view if no gazetteer is set for the locale. The gazetteer configuration object is structured into several configuration keys.

`"provider": "MAPBOX"`

The geolocation service to use \(MAPBOX or GOOGLE\). A corresponding KEY\_\*\*\* is required in the environment settings in order to use a 3rd party service.

`"placeholder": "e.g. London"`

The placeholder to be shown in the gazetteer input.

`"code": "GB"`

The country code to limit the search on 3rd party geolocation services.

`"bounds": "'&location=51.75,-1.25&radius=40'"`

A bounding box or radii to spatially limit the search on 3rd party geolocation services.

`"datasets": []"`

An array of dataset gazetteers which are hit by the autocomplete search first. The 3rd party geolocation service is used once no results are returned from any of the dataset gazetteer entries.

`"layer": "sprawls"`

The layer key in the datasets array object must correspond to a layer defined in the locale's layers.

`"table": "glx_cities_of_the_world"`

The table to be used for the layer. This is required as layers may aggregate data from multiple table.

`"label": "nameascii"`

The field which is searched for the autocomplete match. The label is also displayed in the results list.

`"leading_wildcard": true`

The ILIKE query will pre-fix the search term with a wild card. e.g. 'Man' will find 'Central Manchester' as well as 'Manchester Airport'.

