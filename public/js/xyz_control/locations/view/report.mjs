export default _xyz => entry => {

  if (!entry.report.template) return;

  const href = _xyz.host + '/report?' + _xyz.utils.paramString(
    Object.assign(
      entry.report,
      {
        locale: _xyz.workspace.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        id: entry.location.id,
        token: _xyz.token
      }
    )
  );

  entry.row.appendChild(_xyz.utils.wire()`
    <td style="padding: 10px 0;" colSpan=2>
    <a target="_blank" href="${href}">${entry.report.name || 'Location Report'}</a>
    </td>`);

};