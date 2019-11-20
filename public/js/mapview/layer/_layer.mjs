import mvt from './mvt.mjs';

import mvtLabel from './mvtLabel.mjs';

import geojson from './geojson.mjs';

import cluster from './cluster.mjs';

import clusterLabel from './clusterLabel.mjs';

import tiles from './tiles.mjs';

import grid from './grid.mjs';

export default _xyz => ({

  mvt: mvt(_xyz),

  mvtLabel: mvtLabel(_xyz),
  
  geojson: geojson(_xyz),
    
  cluster: cluster(_xyz),

  clusterLabel: clusterLabel(_xyz),
    
  tiles: tiles(_xyz),
    
  grid: grid(_xyz),
  
});