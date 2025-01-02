import { clusterTemplate } from './cluster.test.mjs';
import { clusterHexTemplate } from './cluster_hex.test.mjs';
import { geojsonTemplate } from './geojson.test.mjs';
import { locationGetTemplate } from './location_get.test.mjs';
import { mvtTemplate } from './mvt.test.mjs';
import { wktTemplate } from './wkt.test.mjs';

//All the deprecated tests need to be re-rewritten and rethought. 
export const templatesTest = {
    setup,
    clusterTemplate,
    clusterHexTemplate,
    geojsonTemplate,
    locationGetTemplate,
    mvtTemplate,
    wktTemplate
}

function setup() {
    codi.describe({ name: 'Workspace Templates:', id: 'api_workspace_template', parentId: 'api_workspace' }, () => { });
}