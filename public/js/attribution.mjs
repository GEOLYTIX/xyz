import _xyz from './_xyz.mjs';

_xyz.attribution_links = document.getElementById('attribution_links');
_xyz.attribution = {};

export function set(attribution) {
  Object.entries(attribution).forEach(entry => {

    // Create new attribution for layer if the same attribution does not exist yet.
    if (!_xyz.attribution[entry[0]]) _xyz.attribution[entry[0]] = _xyz.utils.createElement({
      tag: 'a',
      appendTo : _xyz.attribution_links,
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

  Object.values(_xyz.layers).forEach(layer => {
    if (layer.display && layer.attribution) set(layer.attribution);
  });
}

export function remove() {
  Object.values(_xyz.attribution).forEach(entry => entry.remove());
  _xyz.attribution = {};
}