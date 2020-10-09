export default _xyz => {

  const report = {

    panel: panel,

  }

  return report;


  function panel(layer) {

    if (!layer.reports) return;

    const panel = _xyz.utils.html.node`
    <div class="drawer panel expandable">`;
  
    // Panel header
    panel.appendChild(_xyz.utils.html.node`
    <div
      class="header primary-colour"
      onclick=${e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target, true);
      }}><span>Reports</span><button
      class="btn-header xyz-icon icon-expander primary-colour-filter">`);

    Object.entries(layer.reports).forEach(entry => {

      const href = _xyz.host + '/view?' + _xyz.utils.paramString(
        Object.assign(
          entry[1],
          {
            template: entry[0],
            locale: _xyz.locale.key,
            layer: layer.key,
            lat: _xyz.hooks.current.lat,
            lng: _xyz.hooks.current.lng,
            z: _xyz.hooks.current.z
          }
        )
      );

      panel.appendChild(_xyz.utils.html.node`
      <a
        target="_blank"
        href="${href}"
        class="link-with-img">
        <div class="xyz-icon icon-event-note"></div><span>${entry[0]}`);

    });

    return panel;

  };

}