
import { hasRoles } from '../../utils/roles.js'

export function getLocaleTest() {
    codi.describe('Workspace: Get Locale Test', async () => {

        await codi.it('Workspace: Getting Locales', async () => {
            const locales = await mapp.utils.xhr(`/test/api/workspace/locales`);
            codi.assertEqual(locales[0].key, 'locale', 'Ensure that we are getting a locale back from the API')
        });

        await codi.it('Workspace: Getting a Locale', async () => {
            const locale = await mapp.utils.xhr(`/test/api/workspace/locale?locale=locale`);
            codi.assertTrue(!!locale.key, 'The locale should have a key property');
            codi.assertTrue(!!locale.layers, 'The locale should have layers');
            codi.assertTrue(!!locale.name, 'The locale should have a name');
            codi.assertTrue(!!locale.plugins, 'The locale should have plugins');
            codi.assertTrue(!!locale.syncPlugins, 'The locale should have syncPlugins');
        });

        await codi.it('Workspace: Checking locale for roles', async () => {
            const locale = await mapp.utils.xhr(`/test/api/workspace/locale?locale=locale&layers=true`);
            codi.assertFalse(hasRoles(locale), 'The locale object should have no roles object returned')
        });
    })
}