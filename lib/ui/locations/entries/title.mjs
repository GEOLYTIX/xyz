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
  
    const tooltipSpan = entry.tooltip && mapp.utils.html`
      <span
        class="tooltip mask-icon question-mark">${entry.tooltip}`
  
    return mapp.utils.html.node`
      <div
        class="label"
        style=${entry.css_title}
        title=${entry.tooltip}>${entry.title}
        ${tooltipSpan}`;
  }