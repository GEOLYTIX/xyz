import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_here from './isoline_here.mjs';

export default _xyz => ({

  isoline_mapbox: isoline_mapbox(_xyz),

  isoline_here: isoline_here(_xyz),

});