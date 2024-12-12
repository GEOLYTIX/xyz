import { addLayer } from './addLayer.test.mjs';
import { removeLayer } from './removeLayer.test.mjs';
import { allfeaturesTest } from './allfeatures.test.mjs';
import { attributionTest } from './attribution.test.mjs';
import { fitViewTest } from './fitView.test.mjs';
import { geoJSONTest } from './geojson.test.mjs';
import { geometryTest } from './geometry.test.mjs';
import { getBoundsTest } from './getBounds.test.mjs';
import { infotipTest } from './infotip.test.mjs';
import { locateTest } from './locate.test.mjs';
import { popupTest } from './popup.test.mjs';
import { olControlsTest } from './olcontrols.test.mjs';

export const mapviewTest = {
    // olControlsTest,
    setup,
    addLayer,
    removeLayer
    // allfeaturesTest,
    // attributionTest,
    // fitViewTest,
    // geoJSONTest,
    // geometryTest,
    // getBoundsTest,
    // infotipTest,
    // locateTest,
    // popupTest
}

function setup() {
    codi.describe({ name: 'Mapview:', id: 'mapview' }, () => { })
}