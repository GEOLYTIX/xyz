export default (_xyz, layer) => {

  const hover = Object.assign({

    mousemove: mousemove,

    mapout: mapout,

    remove: remove,

    add: add,

    toggle: toggle

  }, layer.hover || {});

  return hover;

  function mousemove(e) {
    layer.hover.tooltip.style.left = (e.clientX - (layer.hover.tooltip.offsetWidth / 2)) + 'px';
    layer.hover.tooltip.style.top = (e.clientY - 15 - layer.hover.tooltip.offsetHeight) + 'px';
  };

  function mapout() {
    layer.hover.remove();
  }

  function remove() {
    _xyz.mapview.node.removeEventListener('mouseout', mapout);
    _xyz.mapview.node.removeEventListener('mousemove', mousemove);
    if (!layer.hover.tooltip) return;
    layer.hover.tooltip.remove();
    delete layer.hover.tooltip;
  };

  function add(eOrg) {

    if(layer.hover && !layer.hover.permanent) layer.hover.remove();

    _xyz.mapview.node.addEventListener('mouseout', mapout);

    layer.hover.tooltip = _xyz.utils.wire()`<div class="hover-box">`;

    const xhr = new XMLHttpRequest();

    xhr.open(
      'GET',
      _xyz.host +
        '/api/location/field?' +
        _xyz.utils.paramString({
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          table: layer.table,
          id: eOrg.id,
          field: layer.hover.field,
          token: _xyz.token
        }));
  
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
  
    xhr.onload = e => {
  
      if (e.target.status !== 200 || !layer.hover.tooltip) return;
  
      layer.hover.tooltip.innerHTML = e.target.response.field;

      _xyz.mapview.node.appendChild(layer.hover.tooltip);

      layer.hover.tooltip.style.left = (eOrg.x - (layer.hover.tooltip.offsetWidth / 2)) + 'px';
      layer.hover.tooltip.style.top = (eOrg.y - 15 - layer.hover.tooltip.offsetHeight) + 'px';
      layer.hover.tooltip.style.opacity = 1;

      _xyz.mapview.node.addEventListener('mousemove', mousemove);
  
    };
  
    xhr.send();

  };

  function toggle(param){
    if(typeof(layer.hover.permanent) === undefined) return;
    if(layer.hover.btn) layer.hover.btn.remove();
  
      layer.hover.btn = _xyz.utils.createElement({
        tag: 'div',
        options: {
          classList: 'btn_small cursor noselect',
          textContent: layer.hover.permanent ? 'Hide labels' : 'Show labels'
        },
        style: {
          display: 'block',
          float: 'right'
        },
        eventListener: {
          event: 'click',
          funct: e => {
            e.stopPropagation();
            layer.hover.permanent = !layer.hover.permanent;
            _xyz.mapview.node.dispatchEvent(_xyz.mapview.changeEndEvent);
            if(!layer.hover.permanent){
              document.querySelectorAll('#Map > .hover-box').forEach(el => {
                if(el.dataset && el.dataset.layer === layer.key) el.remove();
              });
            }
            layer.get();
          }
        },
        appendTo: param.container
      });
    }
};