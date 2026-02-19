/**
@module @ui/elements/locales

The module exports method to create an interface with dropdown to select locales and nested locales.
*/

/**
@function locales
@async
@description
Calls the buildDropdown method to recursively add locale dropdowns to the elements array rendered into the locales interface node returned.

@param {Object} locale The currently loaded locale object.
@param {Array<Object>} locales Array of accessible locale objects at the current level.
@returns {Promise<HTMLElement|undefined>} Node containing dropdown elements or undefined.
*/
export default async function locales(locale, locales) {
  const elements = [];

  await buildDropdown(elements, locale, 0, locales);

  if (!elements.length) return;

  return mapp.utils.html.node`${elements}`;
}

/**
@function buildDropdown
@async
@description
The method is called recursively to add dropdown elements for locales and nested locales to the elements param.

The nesting level of the current locale can be determined by the locale.keys[] array property.
@param {array} elements Array of HTMLElements.
@param {object} locale The current locale.
@param {number} level Current nesting level.
@param {Array<Object>} locales List of locales at the current level.
@returns {Promise<void>}
*/
async function buildDropdown(elements, locale, level, locales) {
  if (!locales?.length) return;

  // Do not re-query locales for level 0.
  if (level > 0) {
    locales = await mapp.utils.xhr(
      `${mapp.host}/api/workspace/locales?locale=${locale.keys?.slice(0, level).join(',') || locale.key}`,
    );

    if (locales instanceof Error) return;

    // There are no more nested locales at this level.
    if (!locales.length) return;

    // Unshift a locale to step back a level.
    if (locale.keys?.length > level) {
      locales.unshift({
        key: locale.keys.slice(0, level).join(','),
        name: locale.name.split('/').slice(0, level).join('/'),
      });
    }
  }

  let placeholder = locale.keys?.[level] || locale.key;

  // There is no selected locale at this level.
  if (level > 0 && (!locale.keys || locale.keys.length === level)) {
    placeholder = 'Select nested locale';
  }

  const dropdown = mapp.ui.elements.dropdown({
    data_id: `locale-dropdown-${level}`,
    placeholder,
    entries: locales.map((l) => {
      const keys = l.key.split(',');
      const names = l.name.split('/');
      const title = `${keys.length === level ? '<- Back' : ''}${names.slice(level).join('/')}`;

      // Build string for selected from slicing keys[] array with current level.
      const selectedLv = locale.keys
        ? locale.keys.slice(0, level + 1).join(',')
        : locale.key;

      return {
        title,
        key: l.key,
        option: l.key,
        selected: l.key === selectedLv,
      };
    }),
    callback: (e, entry) => {
      globalThis.location.assign(`${mapp.host}?locale=${entry.key}`);
    },
  });

  elements.push(dropdown);

  level++;

  if (level === 1 || locale.keys?.length >= level) {
    await buildDropdown(elements, locale, level, locales);
  }
}
