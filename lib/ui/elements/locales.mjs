export default async function locales(locale, locales) {
  const elements = [];

  // Add locale dropdown to layers panel if multiple locales are accessible.
  if (locales.length > 1) {
    const localesDropdown = mapp.ui.elements.dropdown({
      data_id: 'locales-dropdown',
      placeholder: locale.keys?.[0] || locale.name,
      entries: locales.map((locale) => ({
        title: locale.name || locale.key,
        key: locale.key,
      })),
      callback: (e, entry) => {
        window.location.assign(`${mapp.host}?locale=${entry.key}`);
      },
    });

    elements.push(localesDropdown);
  }

  if (locale.keys?.[0]) {
    // Get list of accessible locales from Workspace API.
    const nestedLocales = await mapp.utils.xhr(
      `${mapp.host}/api/workspace/locales?locale=${locale.keys?.[0]}`,
    );

    const nestedLocalesDropdown = mapp.ui.elements.dropdown({
      data_id: 'locales-dropdown',
      placeholder: `${locale.name}/`,
      entries: nestedLocales.map((locale) => ({
        title: locale.name || locale.key,
        key: locale.key,
      })),
      callback: (e, entry) => {
        window.location.assign(`${mapp.host}?locale=${entry.key}`);
      },
    });

    elements.push(nestedLocalesDropdown);
  }

  if (locale.locales) {
    // Get list of accessible locales from Workspace API.
    const nestedLocales = await mapp.utils.xhr(
      `${mapp.host}/api/workspace/locales?locale=${locale.key}`,
    );

    const nestedLocalesDropdown = mapp.ui.elements.dropdown({
      data_id: 'locales-dropdown',
      placeholder: `${locale.name}/`,
      entries: nestedLocales.map((locale) => ({
        title: locale.name || locale.key,
        key: locale.key,
      })),
      callback: (e, entry) => {
        window.location.assign(`${mapp.host}?locale=${entry.key}`);
      },
    });

    elements.push(nestedLocalesDropdown);
  }

  if (!elements.length) return;

  return mapp.utils.html.node`${elements}`;
}
