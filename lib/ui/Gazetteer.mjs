/**
 * ### mapp.ui.gazetteer()
 * Module to export the gazetteer UI element functions used in mapp.
 * 
 * 
Dictionary entries:
- invalid_lat_long_range

@requires /dictionary

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
export default (gazetteer) => {
  gazetteer = {
    ...gazetteer,
    ...mapp.ui.elements.searchbox({
      name: 'gazetteer-search-input',
      placeholder: gazetteer.placeholder,
      searchFunction: search,
      target: gazetteer.target,
    }),
  };

  function search(e) {
    // Clear results
    gazetteer.list.innerHTML = '';

    // Only search if value has length.
    if (!e.target.value.length) return;

    // Get possible coordinates from input.
    const ll = e.target.value.split(',').map(parseFloat);

    // Check whether coordinates are valid float values.
    if (
      ll.length === 2 &&
      ll.every((n) => typeof n === 'number' && !isNaN(n) && isFinite(n))
    ) {
      // Check if both coordinates are within valid range (latitude: -90 to 90, longitude: -180 to 180).
      const [lat, lng] = ll;

      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        gazetteer.list.appendChild(mapp.utils.html.node`
        <li onclick=${(e) => {
          mapp.utils.gazetteer.getLocation(
            {
              label: `Latitude:${ll[0]}, Longitude:${ll[1]}`,
              lat: ll[0],
              lng: ll[1],
              source: 'Coordinates',
            },
            gazetteer,
          );
        }}><span>Latitude:${ll[0]}, Longitude:${ll[1]}</span>`);

        // Do not search if coordinates are provided.
        return;
      } else {
        // Handle the case where coordinates are not within valid ranges.
        // Add the error as a list item
        gazetteer.list.appendChild(mapp.utils.html.node`
          <li style="color: red;">
            <span>${mapp.dictionary.invalid_lat_long_range}</span>`);
      }
    }

    // An external gazetteer provider is requested
    if (gazetteer.provider) {
      // Check whether the gazetteer provider is available.
      if (!Object.hasOwn(mapp.utils.gazetteer, gazetteer.provider)) {
        console.warn('Requested gazetteer service not available');
      } else {
        // Query the external gazetteer provider
        mapp.utils.gazetteer[gazetteer.provider](e.target.value, gazetteer);
      }
    }

    // Request datasets gazetteer
    mapp.utils.gazetteer.datasets(e.target.value, gazetteer);
  }
};
