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
@property {String} [params.link_class] CSS classes to apply on the final element, optional.
@param {Object} [params.report] report definition. 
@property {String} report.template Template required to use a report or a custom view.
@property {String} [report.label] Display name for report, optional.
@param {Object} [params.params] Any additional parameter to be spread into the report object.
@property {Boolean} [report.dialog] Report or custom page to display in a dialog in the main app window.
@returns {HTMLElement} anchor tag or button when set to display in a dialog.
*/
export default function reportLink(params) {
  params.data_id ??= 'report-link';

  if (params.report) {
    const report_params = {
      template: params.report.template,
      // location or layer properties
      locale:
        params.location?.layer.mapview.locale?.key ||
        params.layer?.mapview.locale?.key,
      layer: params.location?.layer.key || params.layer?.key,
      id: params.location?.id,
      // map position
      lat: mapp.hooks.current?.lat,
      lng: mapp.hooks.current?.lng,
      z: mapp.hooks.current?.z,
      // any additional parameters
      ...params.params,
    };

    params.icon ??= 'description';

    params.href = `${mapp.host}/view?${mapp.utils.paramString(report_params)}`;
  }

  params.href ??= params.url;

  if (!params.href) {
    console.warn(
      `ReportLink ${params.data_id} is missing url or report definition.`,
    );
    return;
  }

  // Assign label from fallback.
  params.label ??= params.report?.label || params.title || mapp.dictionary.link;

  params.icon_class ??= '';
  params.icon_class += ' notranslate material-symbols-outlined';

  // The dialog flag should not be considered on mobile.
  params.dialog ??= !mapp.utils.mobile() && params.report?.dialog;

  params.icon ??= params.dialog ? 'iframe' : 'open_in_new';

  params.link_class ??= '';
  params.link_class += ' link-with-img';

  params.target ??= '_blank';

  const anchor = mapp.utils.html.node`<a
    data-id=${params.data_id}
    class=${params.link_class}
    target=${params.target}
    href="${params.href}">
    <span class=${params.icon_class}>${params.icon}</span>
    <span>${params.label}</span>`;

  if (params.dialog) {
    params.header ??= params.label;
    anchor.onclick = (e) => {
      e.preventDefault();
      iFrameDialog(params);
    };
  }

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
    header: mapp.utils.html`<h2>&nbsp;${params.header}`,
    css_style: 'width: 100%; height: 100%',
    containedCentre: true,
    closeBtn: true,
    content,
  });
}
