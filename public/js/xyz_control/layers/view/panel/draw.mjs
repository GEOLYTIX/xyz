export default (_xyz, layer) => {

  if (!layer.edit) return;

  if(layer.edit.properties && Object.keys(layer.edit).length === 1) return;

  if(layer.edit.properties && layer.edit.delete && Object.keys(layer.edit).length === 2) return;


  // Create cluster panel and add to layer dashboard.
  layer.edit.panel = _xyz.utils.wire()`<div class="panel expandable">`;

  layer.view.dashboard.appendChild(layer.edit.panel);
    

  // Drawing panel header.
  const header = _xyz.utils.wire()`
    <div onclick=${e => {
    e.stopPropagation();
    _xyz.utils.toggleExpanderParent({
      expandable: layer.edit.panel,
      accordeon: true,
      scrolly: _xyz.desktop && _xyz.desktop.listviews,
    });
  }}
    class="btn_text cursor noselect">Editing`;
    
  layer.edit.panel.appendChild(header);


  layer.edit.point && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();

    btn.classList.add('active');
    layer.view.header.classList.add('edited');
    
    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'Point',
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });

  }}
  class="btn_state btn_wide cursor noselect">Point`);
  

  layer.edit.polygon && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();

    btn.classList.add('active');
    layer.view.header.classList.add('edited');

    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'Polygon',
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });

  }}
  class="btn_state btn_wide cursor noselect">Polygon`);
  

  layer.edit.rectangle && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();

    btn.classList.add('active');
    layer.view.header.classList.add('edited');

    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'Circle',
      geometryFunction: _xyz.mapview.lib.draw.createBox(),
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });

  }}
  class="btn_state btn_wide cursor noselect">Rectangle`);
  

  layer.edit.circle && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();

    btn.classList.add('active');
    layer.view.header.classList.add('edited');

    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'Circle',
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });

  }}
  class="btn_state btn_wide cursor noselect">Circle`);


  layer.edit.line && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();

    btn.classList.add('active');
    layer.view.header.classList.add('edited');

    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'LineString',
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });

  }}
  class="btn_state btn_wide cursor noselect">Line`);

 
  if(layer.edit.isoline_mapbox){

    if (typeof(layer.edit.isoline_mapbox) !== 'object') layer.edit.isoline_mapbox = {};   

    let block = _xyz.utils.wire()`<div class="block">`;

    layer.edit.panel.appendChild(block);

    _xyz.geom.isoline_mapbox_control({
      entry: layer,
      container: block
    });

    layer.edit.panel.appendChild(_xyz.utils.wire()`
    <div onclick=${e => {
  
    e.stopPropagation();
    const btn = e.target;
  
    //if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();
  
    btn.classList.add('active');
    layer.view.header.classList.add('edited');
  
    // _xyz.mapview.draw.begin({
    //   layer: layer,
    //   type: 'LineString',
    //   callback: () => {
    //     layer.view.header.classList.remove('edited');
    //     btn.classList.remove('active');
    //   }
    // });
  
  }}
    class="btn_state btn_wide cursor noselect">Isoline Mapbox`);

  }


  // if(layer.edit.isoline_here) {}
    

};