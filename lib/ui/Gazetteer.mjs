/**
 * ### mapp.ui.gazetteer()
 * Module to export the gazetteer UI element functions used in mapp.
 *
 *
Dictionary entries:
- invalid_lat_long_range

@requires /dictionary

@deprecated
 * @module /ui/gazetteer
 */

/**
 * Creates a gazetteer component.
 * @function gazetteer
 * @param {Object} gazetteer - The gazetteer configuration object.
 * @param {HTMLElement} gazetteer.target - The target element to append the gazetteer to.
 * @param {string} gazetteer.placeholder - The placeholder text for the search input.
 * @param {string} [gazetteer.provider] - The external gazetteer provider to use for searching.
 * @returns {Object} The gazetteer object.
 */

mapp.utils.versionCheck?.('4.20') &&
  console.log(
    'mapp.ui.Gazetteer is deprecated, use mapp.controls.gazetteer instead',
  );

export default (gazetteer) => {
  return mapp.controls.gazetteer(gazetteer);
};
