import polyCategorized from './polyCategorized.mjs';

import polyGraduated from './polyGraduated.mjs';

import clusterCategorized from './clusterCategorized.mjs';

import clusterGraduated from './clusterGraduated.mjs';

import grid from './grid.mjs';

export default _xyz => ({

  polyCategorized: polyCategorized(_xyz),

  polyGraduated: polyGraduated(_xyz),

  clusterCategorized: clusterCategorized(_xyz),

  clusterGraduated: clusterGraduated(_xyz),

  grid: grid(_xyz),

});