export default (_xyz, layer) => {

  if (!layer.report) return;

  if (!layer.report.templates) return;


  Object.entries(layer.report.templates).forEach(entry => {

    const href = _xyz.host + '/report?' + _xyz.utils.paramString(
      Object.assign(
        entry[1],
        {
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          token: _xyz.token
        }
      )
    );

    layer.view.dashboard.appendChild(
      _xyz.utils.wire()`
      <div style="margin-top: 10px;"><a target="_blank" href="${href}"><i class="material-icons" style="vertical-align:bottom; font-size: 16px;">event_note</i>${entry[1].name || entry[0]}`
    );

  });
  
};