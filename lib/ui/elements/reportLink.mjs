export default function reportLink(params) {
  //** argument is entry or layer report def
  params.data_id ??= 'report-link';

  if (params.url) {
    // use url value if defined, overrides report definition
    params.href = params.url;
  } else {
    const report_params = {
      template: params.template,
      // location or layer properties
      locale: params.location?.layer?.locale || params.layer?.locale,
      layer: params.location?.layer.key || params.layer?.key,
      id: params.location?.id,
      // map position
      lat: mapp.hooks.current?.lat,
      lng: mapp.hooks.current?.lng,
      z: mapp.hooks.current?.z,
    };

    params.href = `${mapp.host}/view?${mapp.utils.paramString(report_params)}`;
  }

  if (!params.href) {
    console.warn(
      `ReportLink ${params.data_id} is missing url or report definition.`,
    );
    return;
  }

  // why - should this be strict, label prop or dictionary fallback
  params.label ??= params.title || params.key;

  if (params.dialog) {
    // create a button that opens a dialog with iframe
    // return
  }

  // otherwise return an anchor element

  params.icon ??= 'open_in_new';

  params.link_class ??= ``;

  const anchor_class = `link-with-img ${params.link_class}`;

  const anchor = mapp.utils.html.node`<a
      data-id=${params.data_id}
      class=${anchor_class}
      target="_blank"
      href="${params.href}">
      <span class="notranslate material-symbols-outlined">${params.icon}</span>
      <span>${params.label}`;

  return anchor;
}
