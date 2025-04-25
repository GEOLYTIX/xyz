export default (layer) => {
  // Create chkbox controls for each dataview entry.
  const reportLinks = Object.keys(layer.reports).map((key) => {
    const report = layer.reports[key];

    report.key = key;

    report.host = layer.mapview.host;

    const href = `${report.host}/view?${mapp.utils.paramString({
      lat: mapp.hooks.current?.lat,
      lng: mapp.hooks.current?.lng,
      locale: layer.mapview.locale.key,
      template: report.template,
      z: mapp.hooks.current?.z,
    })}`;

    return mapp.utils.html`
      <a
        class="link-with-img"
        target="_blank"
        href="${href}">
        <span class="material-symbols-outlined">summarize</span>
        <span>${report.title || report.key}`;
  });

  // Create a drawer with the dataview chkbox controls.
  const drawer = mapp.ui.elements.drawer({
    class: 'raised',
    content: mapp.utils.html`${reportLinks}`,
    data_id: `reports-drawer`,
    header: mapp.utils.html`
      <h3>Reports</h3>
      <div class="material-symbols-outlined caret"/>`,
  });

  return drawer;
};
