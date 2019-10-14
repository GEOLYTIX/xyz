import search from './search.mjs';

import select from './select.mjs';

import createFeature from './createFeature.mjs';

export default _xyz => {

  const gazetteer = {

    init: init,

    search: search(_xyz),

    select: select(_xyz),

    createFeature: createFeature(_xyz),

    icon: {
      type: 'markerColor',
      colorMarker: '#64dd17',
      colorDot: '#33691e',
      anchor: [0.5, 1],
      scale: 0.05,
    },

    style: {
      strokeColor: '#1F964D',
      strokeWidth: 2,
      fillColor: '#DEF6CA',
      fillOpacity: 0.2,
    }

  };

  return gazetteer;

  function init(params) {

    if (!params) return;

    Object.assign(gazetteer, params);

    // Hide the gazetteer when initialised with a toggle button defined.
    if (gazetteer.toggle) {
      gazetteer.toggle.style.display = 'none';
      gazetteer.toggle.classList.remove('active');
    }

    // Remove the gazetteer group as it will be created during the init.
    if (gazetteer.group) {
      gazetteer.group.remove();
    }

    // The gazetteer will not be initialised with a missing gazetteer definition for the locale.
    if (!_xyz.workspace.locale.gazetteer) return;


    // Group
    gazetteer.group = _xyz.utils.wire()`<div class="gazetteer input_group">`;
    gazetteer.target.appendChild(gazetteer.group);


    // Input
    gazetteer.input = _xyz.utils.wire()`<input type="text" required placeholder=${_xyz.workspace.locale.gazetteer.placeholder || ''}>`;

    // Initiate search on keyup with input value
    gazetteer.input.addEventListener('keyup', e => {

      const keyset = new Set([37, 38, 39, 40, 13]);

      if (
        !keyset.has(e.keyCode || e.charCode) &&
        e.target.value.length > 0) gazetteer.search(e.target.value);

    });

    // Keydown events
    gazetteer.input.addEventListener('keydown', e => {

      const key = e.keyCode || e.charCode;

      const results = gazetteer.result.querySelectorAll('li');

      // Move up through results with up key
      if (key === 38) {
        let i = indexInParent(gazetteer.result.querySelector('.active'));
        if (i > 0) [results[i], results[i - 1]].forEach(el => el.classList.toggle('active'));
        return;
      }

      // Move down through results with down key
      if (key === 40) {
        let i = indexInParent(gazetteer.result.querySelector('.active'));
        if (i < results.length - 1) [results[i], results[i + 1]].forEach(el => { if (el) el.classList.toggle('active') });
        return;
      }

      // Cancel search and set results to empty on backspace or delete keydown
      if (key === 46 || key === 8) {
        if (gazetteer.xhr) gazetteer.xhr.abort();
        gazetteer.result.innerHTML = '';
        if (gazetteer.layer) _xyz.map.removeLayer(gazetteer.layer);
        return;
      }

      // Select first result on enter keypress
      if (key === 13) {

        // Get possible coordinates from input and draw location if valid
        let latlng = e.target.value.split(',').map(parseFloat);
        if ((latlng[1] > -90 && latlng[1] < 90) && (latlng[0] > -180 && latlng[0] < 180)) {
          if (gazetteer.xhr) gazetteer.xhr.abort();
          results = [];
          gazetteer.result.innerHTML = '';
          gazetteer.createFeature({
            type: 'Point',
            coordinates: [latlng[1], latlng[0]]
          });
        }

        // Select active results record
        let activeRecord = results[indexInParent(gazetteer.result.querySelector('.active'))];

        if (!activeRecord && results.length > 0) activeRecord = results[0];

        if (activeRecord && activeRecord['data-id']) gazetteer.select({
          label: activeRecord.innerText,
          id: activeRecord['data-id'],
          source: activeRecord['data-source'],
          layer: activeRecord['data-layer'],
          table: activeRecord['data-table'],
          marker: activeRecord['data-marker']
        }, params.callback || null);

        return;
      }
    });

    // Cancel search and empty results on input focusout
    gazetteer.input.addEventListener('focusout', () => {
      if (gazetteer.xhr) gazetteer.xhr.abort();
      setTimeout(() => gazetteer.result.innerHTML = '', 400);
    });

    gazetteer.group.appendChild(gazetteer.input);
    gazetteer.group.appendChild(_xyz.utils.wire()`<span class="bar">`);


    // Loader
    gazetteer.loader = _xyz.utils.wire()`<div class="loader" style="display: none;">`;
    gazetteer.group.appendChild(gazetteer.loader);


    // Results
    gazetteer.result = _xyz.utils.wire()`<ul></ul>`;

    gazetteer.result.addEventListener('click', e => {
      if (!e.target['data-source']) return;

      if (e.target['data-id']) gazetteer.select({
        label: e.target.innerText,
        id: e.target['data-id'],
        source: e.target['data-source'],
        layer: e.target['data-layer'],
        table: e.target['data-table'],
        marker: e.target['data-marker']
      }, params.callback || null);

    });

    gazetteer.group.appendChild(gazetteer.result);


    // Assign toggle method to a target button.
    if (gazetteer.toggle) {

      gazetteer.toggle.style.display = 'block';
      gazetteer.group.style.display = 'none';

      // Toggle visibility of the gazetteer group
      gazetteer.toggle.onclick = () => {

        gazetteer.toggle.classList.toggle('icons-search-toggle');


        if (gazetteer.group.style.display === 'block') {
          return gazetteer.group.style.display = 'none';
        }

        gazetteer.group.style.display = 'block';
        gazetteer.input.focus();
      };
    }


    // Toggle visibility of the gazetteer group
    if (gazetteer.clear) {
      gazetteer.clear = params.clear;
      gazetteer.clear.addEventListener('click',
        () => gazetteer.input.value = '');
    }

  };

};

function indexInParent(node) {

  if (!node) return -1;

  let children = node.parentNode.childNodes,
    num = 0;

  for (let i = 0; i < children.length; i++) {
    if (children[i] === node) return num;
    if (children[i].nodeType === 1) num++;
  }

}