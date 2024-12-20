
import { hasRoles } from '../../utils/roles.js'

export async function getLocaleTest() {
    codi.describe({
        name: 'Locales',
        id: 'api_workspace_locale',
        parentId: 'api_workspace'
    }, () => {

        codi.it({
            name: 'Getting Locales',
            parentId: 'api_workspace_locale'
        }, async () => {
            const locales = await mapp.utils.xhr(`/test/api/workspace/locales`);
            codi.assertEqual(locales[0].key, 'locale', 'Ensure that we are getting a locale back from the API')
        });

        codi.it({
            name: 'Getting a Locale',
            parentId: 'api_workspace_locale'
        }, async () => {
            const locale = await mapp.utils.xhr(`/test/api/workspace/locale?locale=locale`);

            codi.assertTrue(!!locale.key, 'The locale should have a key property');
            codi.assertTrue(!!locale.layers, 'The locale should have layers');
            codi.assertTrue(!!locale.name, 'The locale should have a name');
            codi.assertTrue(!!locale.plugins, 'The locale should have plugins');
            codi.assertTrue(!!locale.syncPlugins, 'The locale should have syncPlugins');
        });

        codi.it({
            name: 'Checking locale for roles',
            parentId: 'api_workspace_locale'
        }, async () => {
            const locale = await mapp.utils.xhr(`/test/api/workspace/locale?locale=locale&layers=true`);
            codi.assertFalse(hasRoles(locale), 'The locale object should have no roles object returned')
        });
    })
}