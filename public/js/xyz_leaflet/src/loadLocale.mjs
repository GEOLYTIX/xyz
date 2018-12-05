import _xyz from './_xyz.mjs';

export default locale => {

  Object.values(locale.layers).forEach(layer => {

    if (layer.style && layer.style.themes) layer.style.theme = Object.values(layer.style.themes)[0];
    
    if (layer.display) _xyz.addLayer(layer);
  });

};