export default _xyz => layer => {

  if (!layer.style) return;

  layer.style.legend = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'legend'
    }
  });
  
  layer.style.setLegend = dom => {
    layer.style.getLegend();
    dom.appendChild(layer.style.legend);
  };
  
  layer.style.getLegend = () => {
  
    if(!layer.style.theme && layer.format != 'grid') return;
  
    if (layer.format === 'mvt' && layer.style.theme.type === 'categorized') _xyz.layers.legends.polyCategorized(layer);
  
    if (layer.format === 'mvt' && layer.style.theme.type === 'graduated') _xyz.layers.legends.polyGraduated(layer);
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'categorized') _xyz.layers.legends.clusterCategorized(layer);
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'competition') _xyz.layers.legends.clusterCategorized(layer);
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'graduated') _xyz.layers.legends.clusterGraduated(layer);
  
    if (layer.format === 'grid') _xyz.layers.legends.grid(layer);
  
  };
  
  if (layer.style.themes) layer.style.theme = layer.style.themes[Object.keys(layer.style.themes)[0]];
  
  if (layer.style.themes) layer.style.setTheme = theme => {
    layer.style.theme = layer.style.themes[theme];
    layer.show();
  };

};