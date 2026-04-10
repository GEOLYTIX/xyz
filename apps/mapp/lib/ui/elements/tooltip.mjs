/**
## ui/elements/tooltip
Exports tooltip HTML document fragment.

@function ui/elements/tooltip
*/

/**
mapp.ui.elements.tooltip(params)

@description
Adds an inline "help" symbol to indicate that the closest sibling has a tooltip information.

```js
const tooltip = mapp.ui.elements.tooltip({
   content: "My tooltip text"
});

In order to use tooltip symbol on entries, set `entry.tooltip = <text>` to display.
```

@function tooltip
@param {Object} params Params for the tooltip element.
@property {string} [params.data_id='ui-elements-tooltip'] The data-id attribute value for the element, optional.
@property {string} [params.content] Text to display on mouseover. Required, if undefined tooltip creation will be skipped.
@return {HTMLElement} The tooltip HTML node.
*/
export default function tooltip(params = {}) {
  params.data_id ??= 'ui-elements-tooltip';

  if (!params.content) {
    console.warn(
      `mapp.ui.elements.tooltip: content for ${params.data_id} not provided.`,
    );
    return;
  }

  params.node = mapp.utils.html.node`<span 
    data-id=${params.data_id}
    title=${params.content}
    class="tooltip material-symbols-outlined notranslate">help</span>`;

  return params.node;
}
