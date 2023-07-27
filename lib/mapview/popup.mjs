const popup = {}

export default function(params) {

  if (typeof params === 'undefined') {

    // Return true if a popup is present on mapview.
    return popup.node?.parentNode ? true : false;
  }

  const mapview = this;

  // Remove a current tooltip.
  mapview.infotip(null)

  // Remove infotip node element
  popup.node?.remove()

  // Just clears the infotip.
  if (!params) return;

  popup.node = mapp.utils.html.node `<div class="popup box-shadow">`

  popup.node.appendChild(params.content)
  
  popup.overlay && mapview.Map.removeOverlay(popup.overlay)

  popup.overlay = new ol.Overlay({
    element: popup.node,
    position: params.coords || mapview.position,
    positioning: 'bottom-center',
    autoPan: params.autoPan,
    insertFirst: true,
    autoPanAnimation: {
      duration: 250
    }
  })

  mapview.Map.addOverlay(popup.overlay)

}