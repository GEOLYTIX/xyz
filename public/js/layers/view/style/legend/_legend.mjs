import polyCategorized from './polyCategorized.mjs';

import polyGraduated from './polyGraduated.mjs';

import clusterCategorized from './clusterCategorized.mjs';

import clusterGraduated from './clusterGraduated.mjs';

import grid from './grid.mjs';

export default _xyz => {

  const legends = {

    polyCategorized: polyCategorized(_xyz),

    polyGraduated: polyGraduated(_xyz),
  
    clusterCategorized: clusterCategorized(_xyz),
  
    clusterGraduated: clusterGraduated(_xyz),
  
    grid: grid(_xyz),

  };

  return layer => {

    layer.style.legend = _xyz.utils.wire()`<div class="legend">`;

    if (layer.format === 'grid') return legends.grid(layer);

    layer.filter = layer.filter || {};

    // Create / empty legend filter when theme is applied.
    layer.filter.legend = {};

    if (layer.format === 'mvt' && layer.style.theme.type === 'categorized') return legends.polyCategorized(layer);
  
    if (layer.format === 'mvt' && layer.style.theme.type === 'graduated') return legends.polyGraduated(layer);
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'categorized') return legends.clusterCategorized(layer);
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'competition') return legends.clusterCategorized(layer);
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'graduated') return legends.clusterGraduated(layer);

  }

};