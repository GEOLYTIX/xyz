const popup = {}

export default function(params) {

  const mapview = this;

  // Remove infotip node element
  popup.node?.remove()

  // Just clears the infotip.
  if (!params) return;

  popup.node = mapp.utils.html.node `<div class="popup">`

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