export default _xyz => entry => {

  if(!_xyz.dataview.node && !document.getElementById(entry.target_id)) return;

  entry.row.appendChild(_xyz.utils.wire()`
  <td style="padding-top: 5px;" colSpan=2>
  <label class="input-checkbox">
  <input type="checkbox"
    checked=${!!entry.display}
    onchange=${e => {
      entry.display = e.target.checked;
      entry.display ? showTab() : removeTab();
    }}>
  </input>
  <div></div><span>${entry.title || 'Show table'}`);

  if (entry.display) showTab();


  function showTab() {

    if(_xyz.dataview.node && !_xyz.dataview.node.querySelector('.table')) {

      _xyz.dataview.node.querySelector('.tab-content').appendChild(_xyz.utils.wire()`<div class="table">`);

    }

    entry.location.tables.push(entry);

    entry.target = _xyz.dataview.node && _xyz.dataview.node.querySelector('.table') || document.getElementById(entry.target_id);

    if (entry.target) _xyz.dataview.orderedList(entry);

  }

  function removeTab() {

    let idx = entry.location.tables.indexOf(entry);

    if (idx < 0) return;

    entry.location.tables.splice(idx, 1);

    _xyz.dataview.removeTab(entry);
  }
};