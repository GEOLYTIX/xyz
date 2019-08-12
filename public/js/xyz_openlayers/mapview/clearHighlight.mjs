export default _xyz => function() {

  if (_xyz.mapview.infotip.node) _xyz.mapview.infotip.node.remove();

  if (!_xyz.mapview.highlight.layer) return;

  _xyz.mapview.highlight.layer.highlight = true;

  _xyz.mapview.node.style.cursor = 'auto';
              
  _xyz.mapview.highlight.layer.L.setStyle(_xyz.mapview.highlight.layer.L.getStyle());

  _xyz.mapview.highlight = {};
    
};