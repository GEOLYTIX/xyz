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
    element: popup.node,
    position: params.coords || mapview.position,
    positioning: 'bottom-center',
    autoPan: params.autoPan,
    insertFirst: true,
    autoPanAnimation: {
      duration: 250,
    },
  });

  mapview.Map.addOverlay(popup.overlay);
}
