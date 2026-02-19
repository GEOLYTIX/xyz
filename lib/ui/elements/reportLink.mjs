/**
@module ui/elements/reportLink
*/

/**
@function reportLink

@description

@param {Object} params - aligns with entry or layer report object.
@property {String} params.data_id link address, overrides report definition.
@property {String} params.url link address, overrides report definition.
@property {String} params.icon Material Symbol name, optional.
@property {String} params.link_class CSS classes to apply on the final element, optional.
@param {Object} params.report report definition. 
@property {String} params.report.template Template required to use a report or a custom view.
@property {String} params.report.label Display name for report, optional.
@param {Object} params.params Any additional parameters for report creation.
@property {Boolean} params.report.dialog Report or custom page to display in a dialog in the main app window.
@returns {HTMLElement} anchor tag or button when set to display in a dialog.
*/
export default function reportLink(params) {
  //** argument is entry or layer report def
  params.data_id ??= 'report-link';

  if (params.url) {
    // use url value if defined, overrides report definition
    params.href = params.url;
  }

  if (params.report) {
    const report_params = {
      template: params.report.template,
      // location or layer properties
      locale: params.location?.layer?.locale || params.layer?.locale,
      layer: params.location?.layer.key || params.layer?.key,
      id: params.location?.id,
      // map position
      lat: mapp.hooks.current?.lat,
      lng: mapp.hooks.current?.lng,
      z: mapp.hooks.current?.z,
      // any additional parameters
      ...params.params,
    };

    params.href = `${mapp.host}/view?${mapp.utils.paramString(report_params)}`;
  }

  if (!params.href) {
    console.warn(
      `ReportLink ${params.data_id} is missing url or report definition.`,
    );
    return;
  }

  // find a label prop or use dictionary fallback
  const label = [
    params.report?.label,
    params.label,
    params.title,
    mapp.dictionary.link,
  ].find(Boolean);

  if (params.report?.dialog) {
    // skip on mobile
    if (mapp.utils.mobile()) return;
    // create a button that opens a dialog with iframe
    const button_class = `action outlined ${params.link_class || ''}`;
    params.icon ??= 'iframe';
    const button = mapp.utils.html
      .node`<button data-id=${params.data_id} class=${button_class}
      onclick=${(e) => iFrameDialog(params)}>
    <span class="notranslate material-symbols-outlined">${params.icon}</span>
    <span>${label}`;

    return button;
  }

  // otherwise return an anchor element

  params.icon ??= 'open_in_new';

  const anchor_class = `link-with-img ${params.link_class || ''}`;

  const anchor = mapp.utils.html.node`<a
      data-id=${params.data_id}
      class=${anchor_class}
      target="_blank"
      href="${params.href}">
      <span class="notranslate material-symbols-outlined">${params.icon}</span>
      <span>${label}`;

  return anchor;
}

/**
@function iFrameDialog
@description
On button click it opens a dialog with an iframe that points to the custom view page.
@returns {HTMLElement} A dialog ui element with iframe.
*/
function iFrameDialog(params) {
  const content = mapp.utils.html`<iframe src=${params.href}>`;

  params.dialog = mapp.ui.elements.dialog({
    css_style: 'width: 100%; height: 100%',
    containedCentre: true,
    closeBtn: true,
    content,
  });
}
