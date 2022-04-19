export default function tableCurrent() {

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table

  let
    table,

    // Get current zoom level from mapview.
    zoom = parseInt(this.mapview.Map.getView().getZoom()),


    // Get zoom level keys from layer.tables object.
    zoomKeys = Object.keys(this.tables),

    // Get first zoom level key from array.
    minZoomKey = parseInt(zoomKeys[0]),
    maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1])
     
  // Get the table for the current zoom level.
  table = this.tables[zoom]

  // Get the first table if the current zoom level is smaller than the min.
  table = zoom < minZoomKey ? this.tables[minZoomKey] : table

  // Get the last table if the current zoom level is larger than the max.
  table = zoom > maxZoomKey ? this.tables[maxZoomKey] : table

  return table
}