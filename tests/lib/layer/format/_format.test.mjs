import { vector } from './vector.test.mjs';
import { mvt } from './mvt.test.mjs';

export const formats = {
    setup,
    vector,
    mvt
}

function setup() {
    codi.describe({ name: 'format:', id: 'layer_format', parentId: 'layer' }, () => { });
}