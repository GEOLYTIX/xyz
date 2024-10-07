export async function workspaceTest(mapview) {
    await codi.describe(`${mapview.host} : Template Paths Test`, async () => {

        await codi.it('All the templates are valid', async () => {

            // Call the /test workspace method - which should return an empty errors array if all the templates are valid.
            const test = await mapp.utils.xhr(`${mapp.host}/api/workspace/test`);

            // If the test fails, print out the invalid templates.
            if (test.errors > 0) {
                test.errors.forEach(template => {
                    console.error('INVALID PATH:', template);
                });
            }

            codi.assertTrue(test.errors.length === 0, `There are ${test.errors.length} invalid paths for templates`);
        });
    });
}
