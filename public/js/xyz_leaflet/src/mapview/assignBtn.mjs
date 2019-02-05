export default (_xyz, params) => {

  if (!params.btn) return;

  // Disable zoom button at max/min zoom for locale.
  _xyz.view.chkZoomBtn = z => {
    if (_xyz.mapview.btn.ZoomIn) _xyz.mapview.btn.ZoomIn.disabled = !(z < _xyz.ws.locales[_xyz.locale].maxZoom);
    if (_xyz.mapview.btn.ZoomOut) _xyz.mapview.btn.ZoomOut.disabled = !(z > _xyz.ws.locales[_xyz.locale].minZoom);
  };

  return {
    ZoomIn: ZoomIn(params),
    ZoomOut: ZoomOut(params),
    Locate: Locate(params)
  };

  function ZoomIn(params) {

    if (!params.btn.ZoomIn) return;

    params.btn.ZoomIn.onclick = () => {
      let z = _xyz.map.getZoom() + 1;
      _xyz.map.setZoom(z);
      _xyz.view.chkZoomBtn(z);
    };

    return params.btn.ZoomIn;

  }

  function ZoomOut(params) {

    if (!params.btn.ZoomOut) return;

    params.btn.ZoomOut.onclick = () => {
      let z = _xyz.map.getZoom() - 1;
      _xyz.map.setZoom(z);
      _xyz.view.chkZoomBtn(z);
    };

    return params.btn.ZoomOut;

  }

  function Locate(params) {

    if (!params.btn.Locate) return;

    params.btn.Locate.style.display = !_xyz.ws.locales[_xyz.locale].locate ? 'none' : 'block';

    params.btn.Locate.onclick = _xyz.mapview.locate.toggle;

    return params.btn.Locate;

  }
  
};