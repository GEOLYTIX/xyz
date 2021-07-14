import filter_text from './filter_text.mjs';

import filter_numeric from './filter_numeric.mjs';

import filter_in from './filter_in.mjs';

import filter_date from './filter_date.mjs';

import filter_boolean from './filter_boolean.mjs';

export default _xyz => {

  const filter = {

    panel: panel,

    block: block,

    reset: reset,

    filter_text: filter_text(_xyz),

    filter_numeric: filter_numeric(_xyz),

    filter_in: filter_in(_xyz),

    filter_date: filter_date(_xyz),

    filter_boolean: filter_boolean(_xyz),

  }

  return filter;

  function block(layer, filter_entry) {
    const block = _xyz.utils.html.node`
    <div class="drawer">
    <div class="header bold">
    <span>${filter_entry.filter_title || filter_entry.title}</span>
    <button
      class="btn-header xyz-icon icon-close primary-colour-filter"
      onclick=${e => {

        layer.filter.current[filter_entry.field] = {}

        layer.reload()

        layer.show()

        block.remove()

        // Hide clear all filter.
        if (!layer.filter.list.children.length) layer.filter.clear_all.style.display = 'none';

      }}>`;

    layer.filter.list.appendChild(block);

    return block;
  }

  function reset(layer, filter_entry) {

    filter_entry.el.parentNode.removeChild(filter_entry.el);
    filter_entry.el = null;
    if (!layer.filter.list.children.length) layer.filter.clear_all.style.display = 'none';
  }

  function panel(layer) {

    if (!layer.infoj) return;

    if (!layer.infoj.some(entry => entry.filter)) return;

    const infoj = layer.infoj.filter(entry => entry.filter);

    // Add select info to infoj array of filter entries.
    infoj.unshift(_xyz.language.layer_filter_select);

    const panel = _xyz.utils.html.node`
    <div class="drawer panel expandable">`;

    // Panel header
    panel.appendChild(_xyz.utils.html.node`
    <div
      class="header primary-colour"
      onclick=${e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target, true);
      }}><span>${_xyz.language.layer_filter_header}</span><button
      class="btn-header xyz-icon icon-expander primary-colour-filter">`);

    let filter_entries = {};

    Object.values(infoj).forEach(el => {
      if (el.field) filter_entries[el.field] = el.filter_title || el.title || el.field
    });

    layer.filter.select = _xyz.utils.html.node`
      <button class="btn-drop">
        <div
          class="head"
          onclick=${e => {
            e.preventDefault();
            e.target.parentElement.classList.toggle('active');
          }}>
          <span>${_xyz.language.layer_filter_select}</span>
          <div class="icon"></div>
        </div>
        <ul>${Object.entries(filter_entries).map(keyVal => _xyz.utils.html.node`
          <li onclick=${e => {
            const drop = e.target.closest('.btn-drop');
            drop.classList.toggle('active');

            const entry = infoj.find(entry => entry.field === keyVal[0]);

            // Display clear all button.
            layer.filter.clear_all.style.display = 'block';

            if (entry.filter == 'date') return filter.filter_date(layer, entry);

            if (entry.filter === 'numeric') return filter.filter_numeric(layer, entry);

            if (entry.filter === 'like' || entry.filter === 'match') return filter.filter_text(layer, entry);

            if (entry.filter.in) return filter.filter_in(layer, entry);

            if (entry.filter === 'boolean') return filter.filter_boolean(layer, entry);

          }}>${keyVal[1]}`)}`

    panel.appendChild(layer.filter.select);

    layer.filter.clear_all = _xyz.utils.html.node`
    <button
      class="primary-colour"
      style="display: none; margin-bottom: 5px;"
      onclick=${e => {

        e.target.style.display = 'none'

        // Remove all filter blocks.
        layer.filter.list.innerHTML = null

        // Reset layer filter object.
        Object.keys(layer.filter.current).forEach(key => layer.filter.current[key] = {})

        layer.reload()

        layer.show()

      }}>${_xyz.language.layer_filter_clear_all}`

    panel.appendChild(layer.filter.clear_all)

    // Create filter list container to store individual filter blocks.
    layer.filter.list = _xyz.utils.html.node`<div>`

    panel.appendChild(layer.filter.list)

    return panel
  }

}