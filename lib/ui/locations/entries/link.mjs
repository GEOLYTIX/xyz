/**
## ui/locations/entries/link

The link entry module exports the default link_entry method to create link elements for the location view.

@module /ui/locations/entries/link
*/

/**
@function link_entry

@description
This entry function returns an HTML element with a hyperlink to open in a new window. The link is labelled with configurable text and a material symbol for readability.

This element supports report object configuration with a custom template and optional url parameters.

Styling options include altering icon name and its css class and also a placeholder for including other existing css classes on the element itself.

@param {infoj-entry} entry type:link entry.
@property {object} entry.url Target link, required.
@property {object} [entry.params] Optional parameters to include in the url as encoded query string.
@property {object} [entry.report] Optional report configuration if the link corresponds to a report. Using report requires `template` property with optional `label`.
@property {string} [entry.report.template] Identifier for the document to display under the report link, required.
@property {string} [entry.report.label] Optional custom label for the report link.
@property {string} [entry.label] Text to display, defaults to generic link text.
@property {string} [entry.data_id] Optional data_id for element identification.
@property {string} [entry.link_class] Optional classList string applied to the link element, eg. `outlined`.
@property {string} [entry.icon_class] Optional classList string appended to the `notranslate material-symbols-outlined` class for the icon element. 
@property {string} [entry.icon_name] Optional icon name from Material Icons `https://fonts.google.com/icons`. Defaults to `open_in_new` and sets to `description` for reports.

@return {HTMLElement} <a> tag with inline content.
*/
export default function link_entry(entry) {
  // Ensure that params are set for link generation
  entry.params ??= {};

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
    // Assign entry.icon_name to report icon if not defined.
    entry.icon_name ??= 'description';
  }

  if (!entry.url) {
    console.warn(`An entry.url must be defined for the URL path.`);
    return;
  }

  // Construct href from URL + params.
  const href = entry.url + mapp.utils.paramString(entry.params);

  entry.data_id ??= 'link';
  entry.label ??= `${mapp.dictionary.link}`;

  entry.icon_name ??= 'open_in_new';
  entry.icon_class ??= '';
  const icon_class = `notranslate material-symbols-outlined ${entry.icon_class}`;

  entry.link_class ??= '';
  const link_class = `link-with-img ${entry.link_class}`;

  const node = mapp.utils.html.node`<div class="val">
    <a 
      data-id=${entry.data_id}
      target="_blank" 
      class=${link_class}
      href=${href}>
      <span 
        style=${entry.icon_style || ''}
        class=${icon_class}>${entry.icon_name}</span>
      <span>${entry.label}</span>`;

  return node;
}
