export default _xyz => {

  const panes = {
    next: 500,
    list: [],
    create: create
  };

  return panes;

  function create(){

    Object.values(_xyz.layers.list).forEach(layer => {
        
      panes.list.push(_xyz.map.createPane(layer.key));
      _xyz.map.getPane(layer.key).style.zIndex = panes.next++;
      layer.get();
    });
                
    panes.list.push(_xyz.map.createPane('gazetteer'));
    _xyz.map.getPane('gazetteer').style.zIndex = panes.next++;
               
    panes.list.push(_xyz.map.createPane('select'));
    _xyz.map.getPane('select').style.zIndex = panes.next++;
            
    panes.list.push(_xyz.map.createPane('select_marker'));
    _xyz.map.getPane('select_marker').style.zIndex = panes.next++;
            
    panes.list.push(_xyz.map.createPane('select_circle'));
    _xyz.map.getPane('select_circle').style.zIndex = panes.next++;
            
    panes.list.push(_xyz.map.createPane('drawing'));
    _xyz.map.getPane('drawing').style.zIndex = panes.next++;

    panes.list.push(_xyz.map.createPane('drawing_trail'));
    _xyz.map.getPane('drawing_trail').style.zIndex = panes.next++;

    panes.list.push(_xyz.map.createPane('drawing_vertex'));
    _xyz.map.getPane('drawing_vertex').style.zIndex = panes.next++;
            
    panes.list.push(_xyz.map.createPane('default'));
    _xyz.map.getPane('default').style.zIndex = panes.next++;

  }

};