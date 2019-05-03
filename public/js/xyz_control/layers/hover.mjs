export default _xyz => layer => {

  if (!layer.hover) return;

  function mousemove(e) {
    if (!layer.hover.tooltip) return;
    layer.hover.tooltip.style.left = (e.clientX - (layer.hover.tooltip.offsetWidth / 2)) + 'px';
    layer.hover.tooltip.style.top = (e.clientY - 15 - layer.hover.tooltip.offsetHeight) + 'px';
  };

  layer.hover.remove = () => {
    if (!layer.hover.tooltip) return;
    layer.hover.tooltip.remove();
    delete layer.hover.tooltip;
    document.body.removeEventListener('mousemove', mousemove);
  };

  layer.hover.add = eOrg => {

    layer.hover.remove();

    layer.hover.tooltip = _xyz.utils.hyperHTML.wire()`
      <div class="hover-box">`;

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

      document.body.appendChild(layer.hover.tooltip);

      layer.hover.tooltip.style.left = (eOrg.x - (layer.hover.tooltip.offsetWidth / 2)) + 'px';
      layer.hover.tooltip.style.top = (eOrg.y - 15 - layer.hover.tooltip.offsetHeight) + 'px';
      layer.hover.tooltip.style.opacity = 1;

      document.body.addEventListener('mousemove', mousemove);
  
    };
  
    xhr.send();

  };

};