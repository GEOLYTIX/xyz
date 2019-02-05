export default (_xyz, params) => {

  if (!params.btn) return;

  _xyz.btnZoomIn = params.btn.ZoomIn;

  if (_xyz.btnZoomIn) _xyz.btnZoomIn.onclick = () => {
    let z = _xyz.map.getZoom() + 1;
    _xyz.map.setZoom(z);
    _xyz.view.chkZoomBtn(z);
  };

  _xyz.btnZoomOut = params.btn.ZoomOut;

  if (_xyz.btnZoomOut) _xyz.btnZoomOut.onclick = () => {
    let z = _xyz.map.getZoom() - 1;
    _xyz.map.setZoom(z);
    _xyz.view.chkZoomBtn(z);
  };

  // Disable zoom button at max/min zoom for locale.
  _xyz.view.chkZoomBtn = z => {
    if (_xyz.btnZoomIn) _xyz.btnZoomIn.disabled = !(z < _xyz.ws.locales[_xyz.locale].maxZoom);
    if (_xyz.btnZoomOut) _xyz.btnZoomOut.disabled = !(z > _xyz.ws.locales[_xyz.locale].minZoom);
  };
  
  _xyz.btnLocate = params.btn.Locate;

  if (_xyz.btnLocate) _xyz.btnLocate.onclick = _xyz.locate.toggle;

};