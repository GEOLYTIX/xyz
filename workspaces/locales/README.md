# Locales

`"locales": {}`

Locales are regional sub settings. Each locale is defined by it's name, bounds and a set of layers. A locale can be selected from the dropdown next to the input field in the gazetteer module. The dropdown will only be active if more than one locale object is defined in the _appsettings_. The locale 'Global' will be represented as a globe icon.

The current local is defined as url\_hook. For example [https://geolytix.xyz/open/?locale=Global](https://geolytix.xyz/open/?locale=Global) will open the Global locale from the settings for the /open instance.

Each locale is a set of objects which are described here:

`"name": "Europe"`

The display name for the locale. The locale key will be used if not set.

`"bounds": [[25,-45],[75,60]]`

An array of \[lat,lon\] coordinate pairs which define the bounds of a locale. It will not be possible to pan the map outside the bounds. The default bounds are \[\[-90,-180\],\[90,180\]\].

`"minZoom": 5`

`"maxZoom": 9`

The min and max zoom for the leaflet map object. The defaults range is zoom 0 to 20 if not set.

