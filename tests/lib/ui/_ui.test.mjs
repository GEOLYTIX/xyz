import { booleanTest } from './locations/entries/boolean.test.mjs'
import { describe } from 'codi';

export async function uiElementsTest(mapview) {
    await describe('UI elements test', async () => {
        await booleanTest();
    })
}