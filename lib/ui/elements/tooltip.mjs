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
```

@function tooltip
@param {Object} params Params for the tooltip element.
@property {string} [params.data_id='ui-elements-tooltip'] The data-id attribute value for the element, optional.
@property {string} [params.content] Text to display on mouseover.
@return {HTMLElement} The tooltip HTML document fragment. 
*/
export default function tooltip(params = {}) {
  params.data_id ??= 'ui-elements-tooltip';
  params.content ??=
    'Set custom text content in tooltip element configuration.';

  params.tooltipDocumentFragment = mapp.utils.html`<span 
    data-id=${params.data_id}
    title=${params.content}
    class="tooltip material-symbols-outlined notranslate">help</span>`;

  return params.tooltipDocumentFragment;
}
