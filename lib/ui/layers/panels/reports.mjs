export default (layer) => {
  // Create chkbox controls for each dataview entry.
  const reportLinks = Object.keys(layer.reports).map((key) => {
    const report = layer.reports[key];

    report.key = key;

    report.host = layer.mapview.host;

    const href = `${report.host}/view?${mapp.utils.paramString({
      template: report.template,
      locale: layer.mapview.locale.key,
      lat: mapp.hooks.current?.lat,
      lng: mapp.hooks.current?.lng,
      z: mapp.hooks.current?.z,
    })}`;

    return mapp.utils.html`
      <a
        class="link-with-img"
        target="_blank"
        href="${href}">
        <span class="material-symbols-outlined">summarize</div>
        <span>${report.title || report.key}`;
  });

  // Create a drawer with the dataview chkbox controls.
  const drawer = mapp.ui.elements.drawer({
    data_id: `reports-drawer`,
    class: 'raised',
    header: mapp.utils.html`
      <h3>Reports</h3>
      <div class="material-symbols-outlined expander"/>`,
    content: mapp.utils.html`${reportLinks}`
  })
  
  return drawer
}
