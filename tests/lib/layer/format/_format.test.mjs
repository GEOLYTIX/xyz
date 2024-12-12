import { vectorTest } from './vector.test.mjs';
import { mvt } from './mvt.test.mjs';

export const formatTest = {
    setup,
    vectorTest,
    mvt
}

function setup() {
    codi.describe({ name: 'format:', id: 'layer_format', parentId: 'layer' }, () => { });
}