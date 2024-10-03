
/**
 * This test is used to see if the link_button plugin is working as expected.
 * @function linkButtonTest
 */
export function linkButtonTest() {
    codi.describe('Link Button Test', () => {
        codi.it('Should add a link button to the mapButton panel', () => {
            // Get the mapButton element
            const mapButton = document.getElementById('mapButton');
            // Get the link_button from the mapButton (a tag with the title="TITLE HERE")
            const linkButton = mapButton.querySelector('a[title="TITLE HERE"]');

            // Check if the linkButton has the correct href
            codi.assertEqual(linkButton.getAttribute('href'), '/url/url');
        });

        codi.it('Should not add a button if no href is provided', () => {
            // Get the mapButton element
            const mapButton = document.getElementById('mapButton');
            // Get the link_button from the mapButton (a tag with the title="SHOULD NOT BE ADDED AS NO HREF")
            const linkButton = mapButton.querySelector('a[title="SHOULD NOT BE ADDED AS NO HREF"]');

            // Check if the linkButton does not exist
            codi.assertTrue(!linkButton);
        });

        codi.it('Should add multiple buttons if the link_button config is an array', () => {
            // Get the mapButton element
            const mapButton = document.getElementById('mapButton');
            // Get the link_button from the mapButton (a tag with the title="TITLE HERE")
            const linkButton = mapButton.querySelector('a[title="TITLE HERE"]');

            const linkButton2 = mapButton.querySelector('a[title="WILL BE ADDED AS HREF"]');

            // Check if the linkButton has the correct href
            codi.assertEqual(linkButton.getAttribute('href'), '/url/url');

            // Check if the linkButton2 has the correct href
            codi.assertEqual(linkButton2.getAttribute('href'), '/url/url2');
        });

    });
}