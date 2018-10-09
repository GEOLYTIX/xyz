import _xyz from '../_xyz.mjs';

export default layer => _xyz.utils.createElement({
  tag: 'i',
  options: {
    textContent: layer.display ? 'layers' : 'layers_clear',
    className: 'material-icons cursor noselect btn_header',
    title: 'Toggle visibility'
  },
  appendTo: layer.header,
  eventListener: {
    event: 'click',
    funct: e => {
      e.stopPropagation();
  
      if (e.target.textContent === 'layers_clear') {
  
        if (layer.group) _xyz.layer_groups[layer.group].hideAll.style.display = 'block';
  
        layer.display = true;
  
        e.target.textContent = 'layers';
        _xyz.utils.pushHook('layers', layer.layer);
        _xyz.attribution = _xyz.attribution.concat(layer.attribution || []);
  
        //attributionCheck();
  
        layer.getLayer(layer);
  
      } else {
  
        layer.removeLayer(layer);
  
        if (layer.group) {
          _xyz.layer_groups.groups[layer.group].hideAll.style.display =
                                    _xyz.ws.locales[_xyz.locale].groups[layer.group].chkVisibleLayer(layer.group) ?
                                      'block' : 'none';
        }
  
        _xyz.layersCheck();
      }
    }
  }
});