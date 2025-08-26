/**
## ui/locations/entries/title

The key entry module exports a default [location] entry method to process infoj `type:title` entries.

@module /ui/locations/entries/title
*/

/**
mapp.ui.locations.entries.title(entry)

The method returns just the title of the entry.
You can provide a tooltip (shown when hovering over the title).
You can provide a css style for the title (to style the title in a specific way).
@example
```json
{
  "title": "This is a title",
  "type":"title",
  "tooltip": "This is a tooltip",
  "css_title": "font-weight: 800"
}
``` 
@function title
@param {Object} entry
@param {string} entry.title The title of the entry.
@param {string} entry.tooltip The tooltip of the entry.
@param {string} entry.css_title The css of the title.
@return {HTMLElement} The title element.
*/

export default function title(entry) {
  const tooltipIcon =
    entry.tooltip &&
    mapp.utils.html`
      <span class="tooltip notranslate material-symbols-outlined">help</span>`;

  return mapp.utils.html.node`
      <div
        class="label"
        style=${entry.css_title}
        title=${entry.tooltip}>${entry.title}
        ${tooltipIcon}`;
}
