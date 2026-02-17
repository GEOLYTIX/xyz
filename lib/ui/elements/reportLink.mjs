export default function reportLink(params) {

    params.host ??= params.layer.mapview.host;

    params.href ??= `${params.host}/view?${mapp.utils.paramString({
      lat: mapp.hooks.current?.lat,
      lng: mapp.hooks.current?.lng,
      locale: params.layer.mapview.locale.key,
      template: params.template,
      z: mapp.hooks.current?.z,
    })}`;

    // this is from the 
    // const el = mapp.utils.html.node`<a 
    //   data-id=${entry.data_id}
    //   target="_blank" 
    //   class=${link_class}
    //   href=${href}>
    //   <span 
    //     style=${entry.icon_style || ''}
    //     class=${icon_class}>${entry.icon_name}</span>
    //   <span>${entry.label}`

    const el = mapp.utils.html.node`<a
      class="link-with-img"
      target="_blank"
      href="${params.href}">
      <span class="notranslate material-symbols-outlined">${params.icon}</span>
      <span>${params.title || params.key}`

    return el
}
