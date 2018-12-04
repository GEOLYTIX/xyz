import _xyz from './_xyz.mjs';

export default params => {

  _xyz.host = params.host;

  _xyz.map = _xyz.L.map(params.map_id, {
    renderer: _xyz.L.svg(),
    scrollWheelZoom: true,
    zoomControl: false,
    attributionControl: false
  })
    .setView([52, 0], 7);

  // Fire viewChangeEnd after map move and zoomend
  _xyz.map.on('moveend', () => viewChangeEndTimer());
  _xyz.map.on('zoomend', () => viewChangeEndTimer());

  // Use timeout to prevent the viewChangeEvent to be executed multiple times.
  let timer;
  function viewChangeEndTimer() {
    clearTimeout(timer);
    timer = setTimeout(viewChangeEnd, 100);
  }

  function viewChangeEnd() {

    // Load layer which have display set to true.
    Object.values(_xyz.layers).forEach(layer => layer.get());
    
  }

  // // Function to check whether all display layers are drawn.
  // _xyz.layers.check = layer => {

  //     // Set layer to loaded and hide the loader.
  //     if (layer) {
  //         layer.loaded = true;
  //         if (layer.loader) layer.loader.style.display = 'none';
  //         if (_xyz.log) console.log(layer.key + ' loaded.');

  //         // Attribution
  //         if (layer.attribution && layer.display) attribution.set(layer.attribution);

  //     } else {
  //         attribution.check();
  //     }

  //     // Determine whether all layers with display true are loaded.
  //     let chkScore = 0;
  //     Object.values(_xyz.layers.list).forEach(layer => {
  //         chkScore += layer.display ? 1 : 0;
  //         chkScore -= layer.display && layer.loaded ? 1 : 0;
  //     });

  //     // Send info signal that all layers are loaded.
  //     if (_xyz.log && chkScore === 0) console.log('All layers loaded.');

  // };

};