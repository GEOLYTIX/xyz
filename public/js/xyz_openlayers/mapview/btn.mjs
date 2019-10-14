export default _xyz => {

  return {

    _ZoomIn: ZoomIn,

    _ZoomOut: ZoomOut,

    _Locate: Locate,

  };

  function ZoomIn(target, z) {

    _xyz.mapview.btn.ZoomIn = target;

    target.disabled = (z >= _xyz.workspace.locale.maxZoom);

    target.onclick = () => {
      let z = parseInt(_xyz.map.getView().getZoom() + 1);
      _xyz.map.getView().setZoom(z);
      target.disabled = (z >= _xyz.workspace.locale.maxZoom);
    };

    _xyz.mapview.node.addEventListener('changeEnd', ()=>{
      if (_xyz.map.getView().getZoom() >= _xyz.workspace.locale.maxZoom) return target.disabled = true;
      target.disabled = false;
    });
  }
  
  function ZoomOut(target, z) {

    _xyz.mapview.btn.ZoomOut = target;

    target.disabled = (z <= _xyz.workspace.locale.minZoom);

    target.onclick = () => {
      let z = parseInt(_xyz.map.getView().getZoom() - 1);
      _xyz.map.getView().setZoom(z);
      target.disabled = (z <= _xyz.workspace.locale.minZoom);
    };

    _xyz.mapview.node.addEventListener('changeEnd', ()=>{
      if (_xyz.map.getView().getZoom() <= _xyz.workspace.locale.minZoom) return target.disabled = true;
      target.disabled = false;
    });
  }

  function Locate(target) {

    _xyz.mapview.btn.Locate = target;

    target.style.display = !_xyz.workspace.locale.locate ? 'none' : 'block';

    target.onclick = () => {
      _xyz.mapview.locate.toggle();
      target.classList.toggle('icons-gps-not-fixed-toggle');
    };

    if (_xyz.workspace.locale.locate && _xyz.workspace.locale.locate.default) target.click();
  }
  
};