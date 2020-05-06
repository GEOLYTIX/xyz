export default _xyz => entry => {

  if (entry.dependents && entry.dependents.some(
    dependant => entry.location.infoj.some(
        _entry => (!_entry.value && _entry.field === dependant)
      )
    )) delete entry.display;

  entry.layer = entry.location.layer;

  entry.id = entry.location.id;

  if (entry._target === 'location') return entry.target;

  entry._target = entry.target;

  // dataview will be added to location listview
  if (entry.target === 'location') {

    entry.target =  _xyz.utils.wire()`
    <div
      class=${entry.class}
      style="grid-column: 1 / 3; padding-top: 10px;">`;

    _xyz.dataviews.create(entry);

    return entry.target;
  }


  // dataview can be added to a designated target (e.g. on report)
  if (document.getElementById(entry.target)) {

    entry.target = document.getElementById(entry.target);

    _xyz.dataviews.create(entry);

    return;
  }


  // dataview will be added to tabview
  if (_xyz.dataviews.tabview.node) {

    entry.tab_style = `border-bottom: 2px solid ${entry.location.style.strokeColor}`;

    entry.display && _xyz.dataviews.tabview.add(entry);

    entry.location.tabviews.push(entry);

    return _xyz.utils.wire()`
    <label
      class="input-checkbox ${entry.class}"
      style="grid-column: 1 / 3">
      <input
        type="checkbox"
        checked=${!!entry.display}
        onchange=${e => {
          entry.display = e.target.checked;
          if (entry.display) return _xyz.dataviews.tabview.add(entry);
          entry.remove();
        }}>
      </input>
      <div></div><span>${entry.title || 'Dataview'}`;
  }

};