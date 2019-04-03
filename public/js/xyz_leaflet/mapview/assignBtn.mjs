export default (_xyz, params) => {

  if (!params.btn) return;

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
      _xyz.mapview.btn.ZoomIn.disabled = !(z < _xyz.workspace.locale.maxZoom);
    };

    _xyz.mapview.changeEnd = _xyz.utils.compose(_xyz.mapview.changeEnd, ()=>{
      let z = _xyz.map.getZoom();
      _xyz.mapview.btn.ZoomIn.disabled = !(z < _xyz.workspace.locale.maxZoom);
    });

    return params.btn.ZoomIn;

  }

  function ZoomOut(params) {

    if (!params.btn.ZoomOut) return;

    params.btn.ZoomOut.onclick = () => {
      let z = _xyz.map.getZoom() - 1;
      _xyz.map.setZoom(z);
      _xyz.mapview.btn.ZoomOut.disabled = !(z > _xyz.workspace.locale.minZoom);
    };

    _xyz.mapview.changeEnd = _xyz.utils.compose(_xyz.mapview.changeEnd, ()=>{
      let z = _xyz.map.getZoom();
      _xyz.mapview.btn.ZoomOut.disabled = !(z > _xyz.workspace.locale.minZoom);
    });

    return params.btn.ZoomOut;

  }

  function Locate(params) {

    if (!params.btn.Locate) return;

    params.btn.Locate.style.display = !_xyz.workspace.locale.locate ? 'none' : 'block';

    params.btn.Locate.onclick = () => {
      _xyz.mapview.locate.toggle();
      params.btn.Locate.classList.toggle('active');
    };

    return params.btn.Locate;

  }
  
};