import _xyz from '../../../_xyz.mjs';

import filter_text from './filter_text.mjs';

import filter_numeric from './filter_numeric.mjs';

import filter_in from './filter_in.mjs';

import filter_date from './filter_date.mjs';

import output from './output.mjs';

export default layer => {

  // Create current filter object.
  layer.filter.current = {};

  const infoj = layer.infoj.filter(entry => entry.filter);

  // Add select info to infoj array of filter entries.
  infoj.unshift('Select filter from list.');

  // Add filter panel to layer dashboard.
  const panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.dashboard
  });

  // Filter panel title / expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Filter'
    },
    appendTo: panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();

        _xyz.utils.toggleExpanderParent({
          expandable: panel,
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  // Create locales _xyz.utils.dropdown.
  layer.filter.select = _xyz.utils.dropdown({
    appendTo: panel,
    entries: infoj,
    label: 'label',
    val: 'field',
    onchange: e => {

      const entry = infoj.find(entry => entry.field === e.target.value);

      // Disable the current filter in _xyz.utils.dropdown.
      layer.filter.select.options[layer.filter.select.selectedIndex].disabled = true;

      // Set selected index back to select text.
      layer.filter.select.selectedIndex = 0;

      // Display clear all button.
      layer.filter.clear_all.style.display = 'block';

      if (entry.filter == 'date') return filter_date(layer, entry);

      if (entry.filter === 'numeric') return filter_numeric(layer, entry);

      if (entry.filter === 'like' || entry.filter === 'match') return filter_text(layer, entry);

      if (entry.filter.in) return filter_in(layer, entry);

    }
  });

  layer.filter.clear_all = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'btn_small cursor noselect',
      textContent: 'Clear all filters'
    },
    appendTo: panel,
    eventListener: {
      event: 'click',
      funct: e => {

        e.target.style.display = 'none';

        // Hide output button.
        layer.filter.run_output.style.display = 'none';

        // Remove all filter blocks.
        layer.filter.list.innerHTML = null;

        // Enable all options in _xyz.utils.dropdown.
        Object.values(layer.filter.select.options).forEach(opt => opt.disabled = false);

        // Reset layer filter object.
        layer.filter.current = {};

        // Reload layer.
        layer.get();
      }
    }
  });

  layer.filter.list = _xyz.utils.createElement({
    tag: 'div',
    appendTo: panel,
  });

  layer.filter.run_output = output(panel, layer);

};