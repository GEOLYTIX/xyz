/**
## Mapview.popup()

@module /mapview/popup

@param {Object} params
The params object argument.
*/

const popup = {};

export default function (params) {
  if (typeof params === 'undefined') {
    // Returns undefined / falsy if popup.node has been removed.
    return popup.node?.parentNode;
  }

  const mapview = this;

  // Remove a current tooltip.
  mapview.infotip(null);

  // Remove infotip node element
  popup.node?.remove();

  // Just clears the infotip.
  if (!params) return;

  popup.node = mapp.utils.html.node`<div class="popup box-shadow">`;

  popup.node.appendChild(params.content);

  popup.overlay && mapview.Map.removeOverlay(popup.overlay);

  popup.overlay = new ol.Overlay({
    autoPan: params.autoPan,
    autoPanAnimation: {
      duration: 250,
    },
    element: popup.node,
    insertFirst: true,
    position: params.coords || mapview.position,
    positioning: 'bottom-center',
  });

  mapview.Map.addOverlay(popup.overlay);
}
