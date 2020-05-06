export default _xyz => entry => {

  if (!entry.report.template) return;

  const href = _xyz.host + '/view/' + encodeURIComponent(entry.report.template) + '?' + _xyz.utils.paramString(
    Object.assign(
      entry.report,
      {
        locale: _xyz.workspace.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        id: entry.location.id,
        host: _xyz.host
      }
    )
  );

  entry.listview.appendChild(_xyz.utils.wire()`
    <div
      class="${'label lv-0 ' + (entry.class || '')}"
      style="grid-column: 1 / 3;">
      <a
        class="primary-colour"
        target="_blank"
        href="${href}">
          ${entry.report.name || 'Location Report'}`);

};