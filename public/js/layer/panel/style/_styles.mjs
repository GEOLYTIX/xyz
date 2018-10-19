import _xyz from '../../../_xyz.mjs';

import polyGraduated from './polyGraduated.mjs';

import polyCategorized from './polyCategorized.mjs';

import clusterCategorized from './clusterCategorized.mjs';

import clusterGraduated from './clusterGraduated.mjs';

import customStyle from './customStyle.mjs';

export default layer => {

  if (layer.format === 'grid' || layer.format === 'tiles') return;

  // Create styles panel and add to layer dashboard.
  const panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.dashboard
  });

  // Panel title / expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Style'
    },
    appendTo: panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: panel,
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  // Set layer theme
  layer.style.theme = layer.style.theme ?
    layer.style.theme :
    layer.style.themes ?
      layer.style.themes[0] :
      null;

  // Create custom style panel if theme and themes array are null/none.
  if (!layer.style.themes && !layer.style.theme) {
    layer.style.panel = panel;
    return customStyle(layer);
  }

  // Set themes array to the theme if array doesn't exist.
  if (!layer.style.themes) layer.style.themes = [layer.style.theme];

  // Push no theme entry into themes array.
  layer.style.themes.push({ label: 'No theme.' });

  // Create theme drop down
  _xyz.utils.dropdown({
    title: 'Select thematic style…',
    appendTo: panel,
    entries: layer.style.themes,
    label: 'label',
    onchange: e => {

      //clear any applied 'ni' filters when theme changes
      if (layer.style.theme && layer.filter[layer.style.theme.field] && layer.filter[layer.style.theme.field].ni) layer.filter[layer.style.theme.field].ni = [];

      layer.style.theme = layer.style.themes[e.target.selectedIndex];
      applyTheme(layer);
      layer.get();
    }
  });

  // Create style panel element for the theme.
  layer.style.panel = _xyz.utils.createElement({
    tag: 'div',
    appendTo: panel
  });

  applyTheme(layer);

  function applyTheme(layer) {

    layer.style.panel.innerHTML = '';
  
    if ((layer.format === 'mvt' || layer.format === 'geojson')
      && layer.style.theme.type === 'categorized') polyCategorized(layer);
  
    if ((layer.format === 'mvt' || layer.format === 'geojson')
      && layer.style.theme.type === 'graduated') polyGraduated(layer);
  
    if (layer.format === 'cluster'
      && layer.style.theme.type === 'categorized') clusterCategorized(layer);
  
    if (layer.format === 'cluster'
      && layer.style.theme.type === 'graduated') clusterGraduated(layer);
  
    if (!layer.style.theme.type) customStyle(layer);
  
  }

};