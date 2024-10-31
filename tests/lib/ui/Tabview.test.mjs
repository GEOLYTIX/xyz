/**
 * This test is used to test the tabview functions
 * @function Tabview 
 */
export async function Tabview() {

    await codi.describe('UI Test: Tabview', async () => {

        const tabview = document.getElementById('Tabview');

        const tabs = document.querySelector('#Tabview > div.tabs');

        const panel = document.querySelector('#Tabview > div.panel');

        await codi.it('should create a tabview object', () => {

            // Check the tabview object exists
            codi.assertTrue(tabview !== undefined, 'Tabview should exist');
        });

        await codi.it('should create a tabview with two children, tabs and panel', () => {
            // tabview.children should contain div.tabs and div.panel
            codi.assertEqual(tabview.children.length, 2, 'Should be two children');
            codi.assertTrue(tabview.children[0].classList.contains('tabs'), 'First child should be tabs');
            codi.assertTrue(tabview.children[1].classList.contains('panel'), 'Second child should be panel');

        })
        await codi.it('should create a tabview object with two tabs', () => {
            // Check that the tabview object contains a tabs div with two children
            codi.assertEqual(tabs.children.length, 2, 'Should be two children tabs');

        });

        await codi.it('should create a tabview with two tabs with buttons', () => {
            // Check if the first tab has a button inside
            const firstTab = tabs.children[0];
            const buttonInFirstTab = firstTab.querySelector('button');

            codi.assertTrue(!!buttonInFirstTab, 'First tab should contain a button');

            // Check if the second tab has a button inside
            const secondTab = tabs.children[1];
            const buttonInSecondTab = secondTab.querySelector('button');

            codi.assertTrue(!!buttonInSecondTab, 'Second tab should contain a button');
        });

        await codi.it('should create a tabview object with the second tab active', () => {
            // Check that the first child has the active class
            codi.assertTrue(tabs.children[1].classList.contains('active'), 'Second tab should have the active class');
        });

        await codi.it('should create a tabview object with two tabs with the correct button header label', () => {
            // Strip any \n or whitespace and check the content of the first tab
            const firstTabContent = tabs.children[0].innerText.trim();
            const secondTabContent = tabs.children[1].innerText.trim();

            codi.assertEqual(firstTabContent, 'json_1', 'First tab should have content of json_1');
            codi.assertEqual(secondTabContent, 'json_2', 'Second tab should have content of json_2');
        });

        await codi.it('The panel should have the correct value based on the query response', () => {
            // Check that the content is "{"value":2012}"
            codi.assertEqual(panel.textContent, '{"value":2012}', `Panel should have content of "{"value":2012}", actual content is ${panel.textContent}`);
        });

    }
    )
};