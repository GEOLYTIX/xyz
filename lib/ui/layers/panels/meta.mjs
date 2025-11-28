/**
## ui/layers/panels/meta

The meta module exports a method to add a meta panel element to a layer view.
@module /ui/layers/panels/meta
*/

/**
@function meta

@description
The method will create an element with the layer.meta string as innerHTML.

@param {layer} layer
@property {string} layer.meta The content for meta element innerHTML.

@returns {HTMLElement} The meta panel element.
*/
export default function meta(layer) {
  const meta = mapp.utils.html.node`<p data-id="meta" class="meta">`;
  meta.innerHTML = layer.meta;
  return meta;
}
