import { booleanTest } from './locations/entries/boolean.test.mjs'
import { describe } from 'https://esm.sh/codi-test-framework@0.0.26';

export async function uiElementsTest(mapview) {
    await describe('UI elements test', async () => {
        await booleanTest();
    })
}