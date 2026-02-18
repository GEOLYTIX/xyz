/**
 * @module @ui/elements/locales
 * @description Creates nested dropdowns for locale selection in a hierarchical workspace.
 *
 * Displays dropdown menus for selecting locales across multiple levels of nesting.
 * Automatically redirects to deeper locales when only one option exists at a level.
 *
 * @param {Object} locale - The currently loaded locale object with key property.
 * @param {Array} locales - Array of locale objects from the root /api/workspace/locales endpoint.
 * @returns {HTMLElement|undefined} A node containing locale dropdowns, or undefined if no dropdowns needed.
 */

/**
 * @function locales
 * @description Builds nested locale dropdowns recursively based on workspace locale hierarchy.
 * @param {Object} locale - The currently loaded locale object.
 * @param {Array<Object>} locales - Array of accessible locale objects at the current level.
 * @returns {Promise<HTMLElement|undefined>} Node containing dropdown elements or undefined.
 */
export default async function locales(locale, locales) {
  const elements = [];

  const currentPath = toPath(locale.key);

  /**
   * @description Recursively builds dropdowns for locale levels.
   * @param {number} level - Current nesting level.
   * @param {Array<Object>} list - List of locales at this level.
   * @returns {Promise<void>}
   */
  async function buildDropdown(level, list) {
    if (!list?.length) return;

    // The key segment we expect at this level (e.g., "UK" at level 0, "UK,brand_a" at level 1)
    const expectedKey = currentPath.slice(0, level + 1).join(',');
    // Find the locale in this list that matches our current path
    let selected = list.find((l) => toPath(l.key).join(',') === expectedKey);

    if (!selected && list.length === 1) {
      selected = list[0];
    }

    // Always fetch children to determine if there are more levels
    const children = selected
      ? await mapp.utils.xhr(
          `${mapp.host}/api/workspace/locales?locale=${selected.key}`,
        )
      : null;

    // If only 1 option and it has children and we're not at the current level, redirect
    const selectedPath = toPath(selected?.key);
    if (
      list.length === 1 &&
      children?.length &&
      selectedPath.join(',') !== expectedKey
    ) {
      globalThis.location.assign(`${mapp.host}?locale=${selected.key}`);
      return;
    }

    // Show dropdown if multiple options
    if (list.length > 1) {
      const selectedPath = toPath(selected?.key);
      const placeholder = selected
        ? selected.name?.split('/').pop() ||
          selectedPath[selectedPath.length - 1]
        : 'Select Locale';

      const dropdown = mapp.ui.elements.dropdown({
        data_id: `locale-dropdown-${level}`,
        placeholder,
        entries: list.map((l) => {
          const entryPath = toPath(l.key);
          return {
            title: l.name?.split('/').pop() || entryPath[entryPath.length - 1],
            key: l.key,
            option: l.key,
            selected: l.key === selected?.key,
          };
        }),
        callback: (e, entry) => {
          globalThis.location.assign(`${mapp.host}?locale=${entry.key}`);
        },
      });

      elements.push(dropdown);
    }

    // Recurse into children if they exist
    if (children?.length) {
      await buildDropdown(level + 1, children);
    }
  }

  await buildDropdown(0, locales);

  if (!elements.length) return;

  return mapp.utils.html.node`${elements}`;
}

/**
 * @description Converts a locale key to an array path.
 * @param {string|Array} key - Locale key as string or array.
 * @returns {Array<string>} Array of path segments.
 */
function toPath(key) {
  return Array.isArray(key) ? key : String(key).split(',');
}
