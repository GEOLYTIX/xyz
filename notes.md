## 3.1.0

Icon in theme drop down no longer removed after switch.

Check whether remove dataview function exists before trying to remove dataview. A dataview will be pushed into the location array but may not be created if the display is false. This caused an error when trying to remove location with dataviews.

Failing to select location will now remove the hook and not prompt the error message twice.

Datasource Gazetteer may now be set without association to a layer.

```
{
  "source": "lad",
  "table": "coop.vw_uk_glx_geodata_admin_lad_new",
  "label": "lad_name",
  "geom": "geom_4326",
  "dbs": "XYZ"
}
```

The location.remove() will now be assigned before async call to Location API. This ensures that a location can be removed before the location decorator in the callback of the location/get request. [#267](https://github.com/GEOLYTIX/xyz/issues/267)

Dataviews have an active flag to control whether they should be updated.

Check on attribution layer to prevent error thrown when mapview is used without attriubution target.

STATEMENT_TIMEOUT maybe set as environment setting. This will override the default statement of "10000" (10 seconds) for all dbs requests.

Touch interactions set a timeout of 1 second to prevent quick multi-tap for highlight / selection.

Dataviews may have a center property to send the lat lng of the current map view centre to the Query API.

Dataviews now support a queryparams object to be sent to the Query API.

Cluster markers - markerMin/Max now supported within theme markers. [#251](https://github.com/GEOLYTIX/xyz/issues/251)

Tabulator grouped columns - removed displaced borders for cleaner look. [#249](https://github.com/GEOLYTIX/xyz/issues/249)

Fix to document container - newly uploaded document added at the end of the list, original file name is retained instead of unix timestamp. [#262](https://github.com/GEOLYTIX/xyz/issues/262)

Failing to select location will now remove the hook and not prompt the error message twice.

Integer and numeric fields now can be set to empty - previously resulted in database column type error.

Fix to document container - newly uploaded document added at the end of the list, original file name is retained instead of unix timestamp.

Query API to support parameter array or stringified body as $1.

Export JSON and CSV from dataview table fixed.