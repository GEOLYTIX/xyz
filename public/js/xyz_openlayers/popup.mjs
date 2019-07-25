export default _xyz => params => {

  const element = _xyz.utils.wire()`<div class="popup">`;

  element.appendChild(params.content);

  _xyz.mapview.popup.overlay = new _xyz.mapview.lib.Overlay({
    element: element,
    positioning: 'bottom-center',
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });

  _xyz.map.addOverlay(_xyz.mapview.popup.overlay);

  _xyz.mapview.popup.overlay.setPosition(params.coords);

};