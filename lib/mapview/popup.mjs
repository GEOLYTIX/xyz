/**
## /mapview/popup

@module /mapview/popup
*/

const popup = {};

/**
@function Popup

@description
The method creates a popup element that is displayed on the mapview at a specified location. The content of the popup can be an HTML element or a string. The popup is removed when the params argument is falsy or when a new popup is created.

@param {object} params The params object is spread into the interaction defaults.
@param {mapview} mapview The mapview object to which the interaction will be added.
*/
export default function Popup(params, mapview = this) {
  if (typeof params === 'undefined') {
    // Returns undefined / falsy if popup.node has been removed.
    return popup.node?.parentNode;
  }

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
