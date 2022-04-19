export default layer => {

  // Create chkbox controls for each dataview entry.
  const reportLinks = Object.keys(layer.reports).map(key => {

    const report = layer.reports[key]
  
    report.key = key
  
    report.host = layer.mapview.host
  
    const href = `${report.host}/view?${mapp.utils.paramString({
      template: report.template,
      lat: mapp.hooks.current?.lat,
      lng: mapp.hooks.current?.lng,
      z: mapp.hooks.current?.z,
    })}`;
  
    return mapp.utils.html`
      <a
        class="link-with-img"
        target="_blank"
        href="${href}">
        <div class="mask-icon event-note"></div>
        <span>${report.title || report.key}`;
  
  });
  
  // Create a drawer with the dataview chkbox controls.
  const drawer = mapp.ui.elements.drawer({
    data_id: `reports-drawer`,
    class: 'lv-1',
    header: mapp.utils.html`
      <h4>Reports</h4>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`${reportLinks}`
  })
  
  return drawer
}