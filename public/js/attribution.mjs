import _xyz from './_xyz.mjs';

export function set(attribution) {
  Object.entries(attribution).forEach(entry => {

    // Create new attribution for layer if the same attribution does not exist yet.
    if (!_xyz.attribution.layer[entry[0]]) _xyz.attribution.layer[entry[0]] = _xyz.utils.createElement({
      tag: 'a',
      appendTo : document.getElementById('attribution_links'),
      options: {
        textContent: entry[0],
        href: entry[1],
        target: '_blank'
      }
    });
  });
}

export function check() {
      
  remove();

  Object.values(_xyz.layers.list).forEach(layer => {
    if (layer.display && layer.attribution) set(layer.attribution);
  });
}

export function remove() {
  Object.values(_xyz.attribution.layer).forEach(entry => entry.remove());
  _xyz.attribution.layer = {};
}