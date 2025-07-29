/** 
Dictionary entries:
- report
- link

Optional parameters:
`label` - text to display
`css_class` - optional string for css classes to apply on the element, eg. `outlined`.
`icon_class` - string for css classes defaulting to `material-symbols-outlined`.
`icon_name` - optional icon name from Material Icons `https://fonts.google.com/icons`. Defaults to `open_in_new` and sets to `description` for reports.

@requires /dictionary 
*/

/**
@function link_entry

@description
TODO

@param {infoj-entry} entry type:link entry.
@property {object} [entry.params] 
@property {object} [entry.report] 
@property {string} [entry.label] 
@property {object} entry.url

@return {HTMLElement} div element with nested link <a> tag
*/
export default function link_entry(entry) {
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

  const css_class = `link-with-img ${entry.css_class}`;

  const node = mapp.utils.html.node`
    <div class=${css_class}>
      <div style=${entry.icon_style || ''} class=${icon_class}>${entry.icon_name}</div>
      <a target="_blank" href=${href}>${entry.label}`;

  return node;
};
