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
    e.target.classList.add('active');
    _xyz.geom.point(layer);

  }}
  class="btn_state btn_wide cursor noselect">Point`);
  

  layer.edit.polygon && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    e.target.classList.add('active');
    _xyz.geom.polygon(layer);

  }}
  class="btn_state btn_wide cursor noselect">Polygon`);
  

  
  // if(layer.edit.rectangle) _xyz.utils.createStateButton(_xyz, {
  //   text: 'Rectangle',
  //   appendTo: layer.edit.panel,
  //   layer: layer,
  //   activate: _xyz.geom.rectangle,
  //   finish: _xyz.geom.finish
  // });


  // if(layer.edit.circle) _xyz.utils.createStateButton(_xyz, {
  //   text: 'Circle',
  //   appendTo: layer.edit.panel,
  //   layer: layer,
  //   activate: _xyz.geom.circle,
  //   finish: _xyz.geom.finish
  // });


  // if(layer.edit.line) _xyz.utils.createStateButton(_xyz, {
  //   text: 'Linestring',
  //   appendTo: layer.edit.panel,
  //   layer: layer,
  //   activate: _xyz.geom.line,
  //   finish: _xyz.geom.finish
  // });

  
  // if(layer.edit.isoline_mapbox){

  //   if (typeof(layer.edit.isoline_mapbox) !== 'object') layer.edit.isoline_mapbox = {};   

  //   let block = _xyz.utils.createElement({
  //     tag: 'div',
  //     options: {
  //       classList: 'block'
  //     },
  //     appendTo: layer.edit.panel
  //   });

  //   _xyz.geom.isoline_mapbox_control({
  //     entry: layer,
  //     container: block
  //   });

  //   _xyz.utils.createStateButton(_xyz, {
  //     text: 'Isoline Mapbox',
  //     appendTo: layer.edit.panel,
  //     layer: layer,
  //     activate: _xyz.geom.isoline_mapbox,
  //     finish: _xyz.geom.finish
  //   });

  // }


  // if(layer.edit.isoline_here) {
    
  //   if (typeof(layer.edit.isoline_here) !== 'object') layer.edit.isoline_here = {};

  //   let block = _xyz.utils.createElement({
  //     tag: 'div',
  //     options: {
  //       classList: 'block'
  //     },
  //     appendTo: layer.edit.panel
  //   });

  //   _xyz.geom.isoline_here_control({entry: layer, container: block});

  //   _xyz.utils.createStateButton(_xyz, {
  //     text: 'Isoline Here',
  //     appendTo: layer.edit.panel,
  //     layer: layer,
  //     activate: _xyz.geom.isoline_here,
  //     finish: _xyz.geom.finish
  //   });
  
  // }

};