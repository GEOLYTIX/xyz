/**
## /ui/layers/panels/reports
Exports a function for creating a drawer or just a panel which contains links to custom views.

```JSON
    {
      "report_1":{
        "template": "report_template"
      }
    }
```

Supplying `layer.reports.drawer: false` will return the links a plain dev instead of a drawer

@module /ui/layers/panels/filter
*/

/**
@function reports

@description
Creates a list of `a` elements containing links to custom views.

Specifying `layer.reports.drawer: false` will prevent a drawer from being made for the reports panel.

@param {Object} layer
@property {Array} layer.reports The configuration of the reports

@returns {HTMLElement} The report element for the panel.
*/
export default function reports(layer) {
  // Create chkbox controls for each dataview entry.
  const reportLinks = mapp.utils.html.node`<div>`;
  for (const [key, report] of Object.entries(layer.reports)) {
    if (typeof report === 'boolean') continue;

    report.key = key;

    report.host = layer.mapview.host;

    const href = `${report.host}/view?${mapp.utils.paramString({
      lat: mapp.hooks.current?.lat,
      lng: mapp.hooks.current?.lng,
      locale: layer.mapview.locale.key,
      template: report.template,
      z: mapp.hooks.current?.z,
    })}`;

    reportLinks.appendChild(mapp.utils.html.node`
      <div>
      <a
        class="link-with-img"
        target="_blank"
        href="${href}">
        <span class="notranslate material-symbols-outlined">summarize</span>
        <span>${report.title || report.key}`);
  }

  // Create a drawer with the dataview chkbox controls.
  if (layer.reports.drawer === false) {
    return mapp.utils.html
      .node`<div data-id="reports-drawer"><h3>Reports</h3>${reportLinks}`;
  }
  const drawer = mapp.ui.elements.drawer({
    class: 'raised',
    data_id: `reports-drawer`,
    header: mapp.utils.html`
      <h3>Reports</h3>
      <div class="notranslate material-symbols-outlined caret"/>`,
    content: reportLinks,
    popout: layer.reports.popout,
  });

  return drawer;
}
