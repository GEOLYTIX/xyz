/**
### Link Button Plugin
@module /plugins/link_button

```json
"link_button": {
  "href": "/url/url",
  "title": "TITLE HERE",
  "target": "_blank",
  "css_class": "mask-icon",
  "css_style": "mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg); -webkit-mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg);"
}
```

It is possible to define the link_button config as an array to add multiple different links.

```json
"link_button": [
  {
    "href": "/url/url",
    "title": "TITLE HERE",
    "css_style": "mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg); -webkit-mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg);"
  },
  {
    "href": "/foo",
    "title": "Foo"
  }
]

*/
/**
function that will run when the plugin is loaded.
@function link_button
@param {Object} link_button 
*/
export function link_button(link_button) {

    const mapButton = document.getElementById('mapButton');

    if (!mapButton) return;

    if (!link_button) return;

    if (Array.isArray(link_button)) {

        link_button.forEach(addButton)
    } else {

        addButton(link_button)
    }
};

/**
 * @description Add a button to the mapButton panel.
 * @param {Object} link - The link object.
 * @property {string} link.href - The link URL.
 * @property {string} link.title - The link title, defaults to "Link".
 * @property {string} link.target - The link target, defaults to "_blank".
 * @property {string} link.css_class - The class for the div, defaults to "mask-icon".
 * @property {string} link.css_style - The style for the div.
 * @returns {HTMLElement} The button element.
*/
function addButton(link) {

    if (!link?.href) {
        console.warn(`You must provide a href for the link_button plugin.`);
        return;
    }

    link.target ??= '_blank'

    link.css_class ??= 'mask-icon'

    link.title ??= mapp.dictionary.link

    const node = mapp.utils.html.node`
      <a
        title=${link.title}
        href=${link.href}
        target=${link.target}><div
          class=${link.css_class}
          style=${link.css_style}>`;

    mapButton.append(node);
}