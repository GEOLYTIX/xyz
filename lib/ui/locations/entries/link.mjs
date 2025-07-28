/** 
Dictionary entries:
- report
- link

Optional parameters:
`label` - text to display
`icon_class` - string for css classes defaulting to `material-symbols-outlined`
`icon_name` - optional icon name from Material Icons `https://fonts.google.com/icons`

@requires /dictionary 
*/

export default (entry) => {
  // Ensure that params are set for link generation
  entry.params ??= {};

  // Set default label and icon_class
  entry.icon_class ??= '';
  entry.icon_name ??= 'open_in_new';

  const icon_class = `material-symbols-outlined ${entry.icon_class}`;

  if (entry.report) {
    // Assign URL path for report.
    entry.url ??= `${entry.location.layer.mapview.host}/view?`;

    // Assign URL params for report.
    Object.assign(entry.params, {
      id: entry.location.id,
      layer: entry.location.layer.key,
      locale: entry.location.layer.mapview.locale.key,
      template: entry.report.template,
    });

    // Assign entry.label for link text.
    entry.label ??= `${entry.report.label || mapp.dictionary.report}`;
    // Assign entry.icon_name to report icon.
    entry.icon_name = 'description';
  }

  if (!entry.url) {
    console.warn(`An entry.url must be defined for the URL path.`);
    return;
  }

  // Set default label and icon_class
  entry.label ??= `${mapp.dictionary.link}`;

  // Construct href from URL + params.
  const href = entry.url + mapp.utils.paramString(entry.params);

  const node = mapp.utils.html.node`
    <div class="link-with-img outlined">
      <div style=${entry.icon_style || ''} class=${icon_class}>${entry.icon_name}</div>
      <a target="_blank" href=${href}>${entry.label}`;

  return node;
};
