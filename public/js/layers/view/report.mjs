export default _xyz => {

  const report = {

    panel: panel,

  }

  return report;


  function panel(layer) {

    if (!layer.report) return;

    if (!layer.report.templates) return;

    const panel = _xyz.utils.wire()`
    <div class="drawer panel expandable">`;
  
    // Panel header
    panel.appendChild(_xyz.utils.wire()`
    <div
      class="header primary-colour"
      onclick=${e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target, true);
      }}><span>Reports</span><button
      class="btn-header xyz-icon icon-expander primary-colour-filter">`);

    Object.entries(layer.report.templates).forEach(entry => {

      const href = _xyz.host + '/report?' + _xyz.utils.paramString(
        Object.assign(
          entry[1],
          {
            locale: _xyz.workspace.locale.key,
            layer: layer.key,
            token: _xyz.token,
            lat: _xyz.hooks.current.lat,
            lng: _xyz.hooks.current.lng,
            z: _xyz.hooks.current.z
          }
        )
      );

      panel.appendChild(_xyz.utils.wire()`
      <a
        target="_blank"
        href="${href}"
        class="link-with-img">
        <div class="xyz-icon icon-event-note"></div><span>${entry[1].name || entry[0]}`);

    });

    return panel;

  };

}