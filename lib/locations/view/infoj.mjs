export default _xyz => location => {

  if (!location.infoj || location.infoj.length < 1) return;

  location.geometries = location.geometries.filter(geom => {
    _xyz.map.removeLayer(geom)
  });
    
  location.geometryCollection = location.geometryCollection.filter(geom => {
    _xyz.map.removeLayer(geom)
  });

  location.tabviews.forEach(
    tabview => tabview.remove && tabview.remove()
  );

  const listview = _xyz.utils.html.node`
  <div class="location-view-grid" style="display: grid;">`;

  // Create object to hold view groups.
  const groups = {};

  // Iterate through info fields and add to info table.
  for (const entry of location.infoj) {

    if (location.view && location.view.classList.contains('disabled')) break

    if (!entry.edit && entry.value === null) continue

    entry.listview = listview;

    if (document.body.dataset.viewmode === 'report') entry.edit = null;

    entry.location = location;

    // Determine the user-friendly string representation of the value
    entry.displayValue =
      entry.type === 'numeric' ? parseFloat(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 2 }) :
        entry.type === 'integer' ? parseInt(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 0 }) :
          entry.type === 'date' ? _xyz.utils.formatDate(entry.value) :
            entry.type === 'datetime' ? _xyz.utils.formatDateTime(entry.value) :
              entry.value;

    // Add pre- or suffix if specified
    if(entry.prefix) entry.displayValue = entry.prefix + entry.displayValue;
    if(entry.suffix) entry.displayValue = entry.displayValue + entry.suffix;

    if (entry.group) {

      // Create new group
      if (!groups[entry.group]) {

        groups[entry.group] = _xyz.utils.html.node`
        <div
          class="${`drawer group panel expandable ${entry.class || ''}`}"
          style="display: grid; grid-column: 1 / 3; max-height: 20px;">
          <div
            class="header primary-colour"
            style="text-align: left; grid-column: 1 / 3;"
            onclick=${e => {
              _xyz.utils.toggleExpanderParent(e.target);
            }}>
            <span>${entry.group}</span>
            <span class="xyz-icon btn-header icon-expander primary-colour-filter">`;

        entry.listview.appendChild(groups[entry.group]);
      }

      entry.group_class && entry.group_class.split(' ').forEach(_class => groups[entry.group].classList.add(_class));

      entry.expanded && groups[entry.group].classList.add('expanded');

      entry.listview = groups[entry.group];
    }

    if (entry.script && !entry.type) {

      const script_tag = document.createElement("script")
      
      script_tag.src = entry.src

      entry.target = _xyz.utils.html.node`
      <div style="grid-column: 1 / 3;" class="${entry.class || ''}">`;

      const eF = e => {
        e.detail(_xyz, entry);
        document.removeEventListener(entry.script, eF, true);
        script_tag.remove();
      }
    
      document.addEventListener(entry.script, eF, true);

      entry.target.appendChild(script_tag);

      entry.listview.appendChild(entry.target);
      
      continue
    }

    if (entry.type === 'dataview') {

      const dataview = _xyz.locations.view.dataview(entry);
      
      dataview && entry.listview.appendChild(dataview);
      
      continue
    }

    // Create new table cell for the entry title and append to table.
    if (entry.title) {

      entry.title_div = _xyz.utils.html.node`
      <div
        class="${`label lv-${entry.level || '0'} ${entry.class || ''}`}"
        style="${`grid-column: 1; ${entry.css_title}`}"
        title="${entry.tooltip || null}">${entry.title}`;

      entry.listview.appendChild(entry.title_div);
    }

    // display layer name in location view
    if(entry.type === 'key') {

      entry.listview.appendChild(_xyz.utils.html.node`
      <div
        class="${`label lv-0 ${entry.class || ''}`}"
        style="grid-column: 2; margin: 3px;">
        <span
          title=${_xyz.language.location_source_layer}
          style="${'float: right; padding: 3px; cursor: help; border-radius: 2px; background-color: ' + (_xyz.utils.Chroma(location.style.strokeColor).alpha(0.3)) + ';'}"
          >${location.layer.name || location.layer.key}`);

      continue
    }

    if (entry.type && entry.type === 'title') {
      entry.title_div.style.gridColumn = "1 / 3";
      continue
    }

    if (entry.type && entry.type === 'streetview') {
      _xyz.locations.view.streetview(entry);
      continue
    }

    if (entry.type && entry.type === 'report') {
      _xyz.locations.view.report(entry);
      continue
    }

    if (entry.type && entry.type === 'images') {
      _xyz.locations.view.images(entry);
      continue
    }

    if (entry.type && entry.type === 'documents') {
      _xyz.locations.view.documents(entry);
      continue
    }

    if (entry.type && entry.type === 'geometry') {
      _xyz.locations.view.geometry(entry);
      continue
    }

    if (entry.type && entry.type === 'boolean') {
      _xyz.locations.view.boolean(entry);    
      continue
    }

    if (entry.type && entry.type === 'json') {
      _xyz.locations.view.json(entry);    
      continue
    }

    // Remove empty row which is not editable.
    if (!entry.query && !entry.edit && !entry.displayValue) continue

    // Create val table cell in a new line.
    if (!entry.inline && !(entry.type === 'integer' ^ entry.type === 'numeric' ^ entry.type === 'date')) {

      if(entry.title_div) entry.title_div.style.gridColumn = "1 / 3";

      // Create new row and append to table.
      entry.val = _xyz.utils.html.node`
      <div
        class="${`val ${entry.class || ''}`}"
        style="${`grid-column: 1 / 3; ${entry.css_val}`}">`;

      entry.listview.appendChild(entry.val);

    // Else create val table cell inline.
    } else {

      // Append val table cell to the same row as the title table cell.
      entry.val = _xyz.utils.html.node`
      <div
        class="${`val num ${entry.class || ''}`}"
        style="${`grid-column: 2; ${entry.css_val}`}">`;
      
      entry.listview.appendChild(entry.val);
    }

    if (entry.query) {

      entry.layer = entry.location.layer;
      entry.id = entry.location.id;

      _xyz.query(entry).then(response => {
        entry.val.textContent = Object.values(response)[0]
      });
      
      continue
    }

    // Create controls for editable fields.
    if (entry.edit && !entry.fieldfx) {
      _xyz.locations.view.edit.input(entry);
      continue
    }

    if (entry.type && entry.type === 'html') {

      // Directly set the HTML if raw HTML was specified
      entry.val.style = "grid-column: 1 / 3;";
      entry.val.innerHTML = entry.value;
      continue
    }

    // otherwise use the displayValue
    entry.val.textContent = entry.displayValue;
    continue

  };

  return listview;

};