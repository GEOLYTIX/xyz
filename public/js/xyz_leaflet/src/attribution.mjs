export default _xyz => {

  _xyz.attribution.create = () => {

    if (_xyz.attribution.container) _xyz.attribution.container.remove();

    _xyz.attribution.container = _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'attribution'
      },
      appendTo: _xyz.map_dom
    });

    _xyz.utils.createElement({
      tag: 'a',
      options: {
        classList: 'logo',
        textContent: 'GEOLYTIX',
        href: 'https://geolytix.co.uk',
        target: '_blank'
      },
      appendTo: _xyz.attribution.container
    });

    const attribution_links = _xyz.utils.createElement({
      tag: 'div',
      options: {
        id: 'attribution_links'
      },
      appendTo: _xyz.attribution.container
    });

    _xyz.utils.createElement({
      tag: 'a',
      options: {
        classList: 'leaflet',
        innerHTML: '<i class="material-icons">favorite</i> Leaflet',
        href: 'https://leafletjs.com',
        target: '_blank'
      },
      appendTo: attribution_links
    });

    _xyz.utils.createElement({
      tag: 'a',
      options: {
        classList: 'xyz',
        textContent: ' XYZ',
        href: 'https://github.com/geolytix/xyz',
        target: '_blank'
      },
      appendTo: attribution_links
    });

  };

  _xyz.attribution.set = attribution => {

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

  };

  _xyz.attribution.removeAll = () => {

    Object.values(_xyz.attribution.layer).forEach(entry => entry.remove());

    _xyz.attribution.layer = {};

  };

  _xyz.attribution.remove = attribution => {

    Object.entries(attribution).forEach(entry => {

    // Create new attribution for layer if the same attribution does not exist yet.
      if (_xyz.attribution.layer[entry[0]]) {
        _xyz.attribution.layer[entry[0]].remove();
        delete _xyz.attribution.layer[entry[0]];
      }

    });

  };

};