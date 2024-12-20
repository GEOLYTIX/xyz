/**
## /plugins/link_button
The module exports the link_button plugin method to mapp.plugins{}

Dictionary entries:
- link

@requires /dictionary

@module /plugins/link_button
*/

/**
@function link_button

@description
The link_button locale property is provided as the link_button function argument. This can be either a single object or an array of objects.
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
```
The link_button method will call the addButton method for each link_button object.

@param {Object} link_button The link_button config, can be an array of objects.
*/
let mapButton
export function link_button(link_button) {

  mapButton = document.getElementById('mapButton');

  if (!mapButton) return;

  if (!link_button) return;

  if (Array.isArray(link_button)) {

    link_button.forEach(addButton)
  } else {

    addButton(link_button)
  }
};

/**
@function addButton
@description
The addButton method creates a link element and appends the element to the mapButton.

@param {Object} link The link object.
@property {string} link.href The link URL.
@property {string} link.title The link title, defaults to "Link".
@property {string} link.target The link target, defaults to "_blank".
@property {string} link.css_class The class for the div, defaults to "mask-icon".
@property {string} link.css_style The style for the div.
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