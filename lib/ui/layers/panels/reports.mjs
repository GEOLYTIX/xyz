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

@module /ui/layers/panels/reports
*/

/**
@function reports

@description
Creates a list of `a` elements containing links to custom views.

Specifying `layer.reports.drawer: false` will prevent a drawer from being made for the reports panel.

@param {layer} layer

@property {array} layer.reports The configuration of the reports
@property {boolean} [reports.popout] Whether the drawer can be popped out into a dialog.
@property {string} [reports.classList] The string will be appended to the drawer element classlist.

@returns {HTMLElement} The report element for the panel.
*/
export default function reports(layer) {
  // Create chkbox controls for each dataview entry.
  const reports = [];
  for (const [key, report] of Object.entries(layer.reports)) {
    if (typeof report === 'boolean') continue;

    report.key = key;

    report.host = layer.mapview.host;

    report.href ??= `${report.host}/view?${mapp.utils.paramString({
      lat: mapp.hooks.current?.lat,
      lng: mapp.hooks.current?.lng,
      locale: layer.mapview.locale.key,
      template: report.template,
      z: mapp.hooks.current?.z,
    })}`;

    report.icon ??= 'summarize';

    reports.push(mapp.utils.html.node`<a
      class="link-with-img"
      target="_blank"
      href="${report.href}">
      <span class="notranslate material-symbols-outlined">${report.icon}</span>
      <span>${report.title || report.key}`);
  }

  // Create a drawer with the dataview chkbox controls.
  const drawer = mapp.ui.elements.drawer({
    drawer: layer.reports.drawer,
    class: layer.reports.classList || '',
    data_id: `reports-drawer`,
    header: mapp.utils.html`
      <h3>Reports</h3>`,
    content: mapp.utils.html`${reports}`,
    popout: layer.reports.popout,
  });

  return drawer;
}
