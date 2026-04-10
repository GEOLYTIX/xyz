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
icon_name is the name of the symbol in Material Icons resources.
```json
"link_button": [
  {
    "href": "/url/url",
    "title": "TITLE HERE",
    "css_style": "color: blue;",
    "icon_name": "grid_view"
  },
  {
    "href": "/foo",
    "title": "Foo",
    "locale": true
  }
]
```
The link_button method will call the addButton method for each link_button object.

@param {Object} link_button The link_button config, can be an array of objects.
@param {mapview} mapview The mapview object.
*/
let mapButton;
export function link_button(link_button, mapview) {
  mapButton = mapview.mapButton;
  const localeKey = mapview.locale.key;

  if (!mapButton) return;

  if (!link_button) return;

  if (Array.isArray(link_button)) {
    link_button.forEach((link) => addButton(link, localeKey));
  } else {
    addButton(link_button, localeKey);
  }
}

/**
@function addButton
@description
The addButton method creates a link element and appends the element to the mapButton.

@param {Object} link The link object.
@param {string} localeKey The key of the current mapview locale.
@property {string} link.href The link URL.
@property {string} link.title The link title, defaults to "Link".
@property {string} link.target The link target, defaults to "_blank".
@property {string} link.css_class Optional class for the symbol container.
@property {string} link.css_style The style for the symbol container.
@property {string} link.icon_name The name for Material Icons symbol. Read more: https://fonts.google.com/icons
@property {boolean} [link.locale] Whether to append the locale to the href.
*/
function addButton(link, localeKey) {
  if (!link?.href) {
    console.warn(`You must provide a href for the link_button plugin.`);
    return;
  }

  if (link.locale) {
    link.href = `${link.href}?locale=${localeKey}`;
  }

  link.css_class ??= '';

  const css_class = `notranslate material-symbols-outlined ${link.css_class}`;

  // If no icon name is provided, warn
  if (!link.icon_name) {
    console.warn(
      `You must provide an icon_name for the link_button plugin. If applicable, remove the mask-icon from the css_class property and/or the svg links from the css_style property.`,
    );
    return;
  }

  link.icon_name ??= 'open_in_new';

  link.title ??= mapp.dictionary.link;

  const node = mapp.utils.html.node`
    <a
      title=${link.title}
      href=${link.href}
      target=${link.target}>
      <span
      class=${css_class}
      style=${link.css_style}>${link.icon_name}`;

  mapButton.append(node);
}
