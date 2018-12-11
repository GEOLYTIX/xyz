import _xyz from '../../_xyz.mjs';

// Zoom functions
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');

if (btnZoomIn && btnZoomOut) {

// Disable zoom button at max/min zoom for locale.
  _xyz.view.chkZoomBtn = z => {
    btnZoomIn.disabled = z < _xyz.ws.locales[_xyz.locale].maxZoom ? false : true;
    btnZoomOut.disabled = z > _xyz.ws.locales[_xyz.locale].minZoom ? false : true;
  };
  
  btnZoomIn.addEventListener('click', () => {
    let z = _xyz.map.getZoom() + 1;
    _xyz.map.setZoom(z);
    _xyz.view.chkZoomBtn(z);
  });
  
  btnZoomOut.addEventListener('click', () => {
    let z = _xyz.map.getZoom() - 1;
    _xyz.map.setZoom(z);
    _xyz.view.chkZoomBtn(z);
  });

}