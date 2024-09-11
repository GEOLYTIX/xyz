import { addLayerTest } from './addLayer.test.mjs';
import { allfeaturesTest } from './allfeatures.test.mjs';
import { attributionTest } from './attribution.test.mjs';
import { fitViewTest } from './fitView.test.mjs';
import { geoJSONTest } from './geojson.test.mjs';
import { geometryTest } from './geometry.test.mjs';
import { getBoundsTest } from './getBounds.test.mjs';
import { infotipTest } from './infotip.test.mjs';
import { locateTest } from './locate.test.mjs';
import { popupTest } from './popup.test.mjs';

export async function olControlsTest(mapview) {
    await codi.describe('Mapview', async () => {
        codi.it('The Mapview should have controls', () => {
            codi.assertTrue(mapview.controls.length >= 1, 'The ol controls array should be greater or equal to 1');
        });
    });
};


export const mapviewTest = {
    olControlsTest,
    addLayerTest,
    allfeaturesTest,
    attributionTest,
    fitViewTest,
    geoJSONTest,
    geometryTest,
    getBoundsTest,
    infotipTest,
    locateTest,
    popupTest
}