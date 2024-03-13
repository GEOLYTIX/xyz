/**
### mapp.layer.changeEnd(layer)

@module /layer/featureFilter
*/

export default function(layer) {

  // The layer may be zoom level restricted.
  layer.tables && layer.mapview.Map.getTargetElement().addEventListener('changeEnd', changeEnd)

  function changeEnd() {

    // Layer is out of zoom range.
    if (!layer.tableCurrent()) {

      if (layer.display) {

        // Layer should be shown if possible.
        layer.zoomDisplay = true
        layer.hide()
      }

      return;
    }

    if (layer.zoomDisplay) {

      // Prevents layer.show() being fired on zoom change within range.
      delete layer.zoomDisplay

      // Show layer if within zoomDisplay range.
      layer.show()
    }
  }
}
