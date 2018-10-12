import _xyz from '../../../_xyz.mjs';

import polyGraduated from './polyGraduated.mjs';

import polyCategorized from './polyCategorized.mjs';

import clusterCategorized from './clusterCategorized.mjs';

import clusterGraduated from './clusterGraduated.mjs';

export default (layer, panel) => {

  // Create panel block.
  let block = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'section expandable'
    },
    appendTo: panel
  });

  // Create block title expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Themes'
    },
    appendTo: block,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: block,
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  // Create panel block.
  layer.legend = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'legend'
    }
  });

  // set theme to first theme from array
  if (!layer.style.theme) layer.style.theme = layer.style.themes[0] || null;

  if (layer.style.themes) {

    // Create theme drop down
    _xyz.utils.dropdown({
      title: 'Select thematic style…',
      appendTo: block,
      entries: layer.style.themes,
      label: 'label',
      onchange: e => {
        layer.legend.innerHTML = '';

        // clear any applied 'ni' filters when theme changes
        if (layer.style.theme && layer.filter[layer.style.theme.field] && layer.filter[layer.style.theme.field].ni) layer.filter[layer.style.theme.field].ni = [];

        layer.style.theme = layer.style.themes[e.target.selectedIndex];
        applyTheme(layer);
        layer.get();
      }
    });

    block.classList += ' expanded';

  } else {

    // Single theme title.
    if (layer.style.theme.label) _xyz.utils.createElement({
      tag: 'span',
      options: {
        classList: 'title',
        textContent: layer.style.theme.label
      },
      appendTo: block
    });
  }

  block.appendChild(layer.legend);
    
  applyTheme(layer);
    
  function applyTheme(layer) {
        
    if(layer.style.theme){
            
      layer.legend.innerHtml = '';
            
      if ((layer.format === 'mvt' || layer.format === 'geojson')
            && layer.style.theme.type === 'categorized') polyCategorized(layer);
            
      if ((layer.format === 'mvt' || layer.format === 'geojson')
            && layer.style.theme.type === 'graduated') polyGraduated(layer);
            
      if (layer.format === 'cluster'
            && layer.style.theme.type === 'categorized') clusterCategorized(layer);
            
      if (layer.format === 'cluster'
            && layer.style.theme.type === 'graduated') clusterGraduated(layer);
    }
  }
};