# 3.3.1

Documentation to use /xyz directory.

Documentation:

  - Develop / API / Workspace
  - Develop / API / User
  - Develop / Mapview
  - Develop / Mapview / Interactions
  - Develop / Security / Authentication
  - Workspace / Style / Label
  - Workspace / Templates

Fix for zero workspace with get empty locales array.

Change clear_cache URL param to cache.

Move auth modules into user API modules.

Fix for long values overfloing location view. [#258](https://github.com/GEOLYTIX/xyz/issues/258)

Fix for MVT filtering and caching.

css_title and css_val for infoj fields to provide inline css rules.

Fix for null values in mvt categorized theme.

Add check for layer format. Layers with missing or invalid formats will now be omitted rather than crashing the application.