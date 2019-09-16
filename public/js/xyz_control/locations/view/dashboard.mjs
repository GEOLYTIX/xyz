export default _xyz => entry => {

  entry.row.appendChild(_xyz.utils.wire()`
  <td style="padding-top: 5px;" colSpan=2>
  <label class="checkbox">${entry.title || 'Show dashboard'}
  <input type="checkbox"
    checked=${!!entry.display}
    onchange=${e => {
    entry.display = e.target.checked;
    entry.display ?
      showTab() :
      removeTab();
  }}>
  <div class="checkbox_i">`);

  if (entry.display) showTab();


  function showTab() {

    entry.location.tables.push(entry);

    entry.target = _xyz.tableview.node && _xyz.tableview.node.querySelector('.tab-content') || document.getElementById(entry.target_id);

    if (entry.target) _xyz.tableview.dashboard(entry);

    console.log(entry.location);
  }

  function removeTab() {

    let idx = entry.location.tables.indexOf(entry);

    if (idx < 0) return;

    entry.location.tables.splice(idx, 1);

    _xyz.tableview.removeTab(entry);
  }
};