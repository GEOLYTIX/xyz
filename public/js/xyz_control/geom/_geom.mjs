import point_edit from './point_edit.mjs';

import polygon_edit from './polygon_edit.mjs';

export default _xyz => ({

  point_edit: point_edit(_xyz),

  polygon_edit: polygon_edit(_xyz),

});