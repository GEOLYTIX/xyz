import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_here from './isoline_here.mjs';

import delete_geom from './delete_geom.mjs';

export default _xyz => entry => {

  entry.ctrl = {

    isoline_here: isoline_here(_xyz),

    isoline_mapbox: isoline_mapbox(_xyz),

    delete_geom: delete_geom(_xyz),

  };

  if (!entry.value && !entry.edit) return;

  entry.style = Object.assign(
    {},
    entry.location.style,
    entry.style
  );

  let td = _xyz.utils.createElement({
    tag: 'td',
    style: {
      paddingTop: '5px',
      position: 'relative'
    },
    options: {
      colSpan: '2'
    },
    appendTo: entry.row
  });


  function drawGeom() {

    entry.ctrl.geometry = _xyz.geom.geoJSON({
      json: {
        type: 'Feature',
        geometry: JSON.parse(entry.value)
      },
      pane: entry.location.layer,
      style: entry.style
    });
    entry.location.geometries.push(entry.ctrl.geometry);
  
  }

  entry.ctrl.showGeom = () => drawGeom();

  if (entry.edit && entry.edit.isoline_here) entry.ctrl.showGeom = entry.ctrl.isoline_here;

  if (entry.edit && entry.edit.isoline_mapbox) entry.ctrl.showGeom = entry.ctrl.isoline_mapbox;
  

  entry.ctrl.hideGeom = () => {

    entry.location.geometries.splice(
      entry.location.geometries.indexOf(entry.ctrl.geometry),
      1
    );

    _xyz.map.removeLayer(entry.ctrl.geometry);
  };

  if (entry.edit) {
    entry.ctrl.hideGeom = entry.ctrl.delete_geom;
  }

  entry.ctrl.toggle = _xyz.utils.createCheckbox({
    label: entry.name || 'Additional geometries',
    appendTo: td,
    onChange: () => {

      entry.ctrl.toggle.checked ?
        entry.ctrl.showGeom(entry) :
        entry.ctrl.hideGeom(entry);

    }
  });

  if (entry.value && !entry.edit) {
    entry.ctrl.toggle.checked = true;
    entry.ctrl.toggle.onchange();
  }

  if (entry.value && entry.edit) {
    entry.ctrl.toggle.checked = true;

    drawGeom();
  }

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'sample-circle'
    },
    style: {
      backgroundColor: _xyz.utils.hexToRGBA(entry.style.fillColor, entry.style.fillOpacity),
      borderColor: _xyz.utils.hexToRGBA(entry.style.color, 1),
      borderStyle: 'solid',
      borderWidth: _xyz.utils.setStrokeWeight(entry),
      position: 'absolute',
      right: 0,
      top: '5px'
    },
    appendTo: td
  });

  if(entry.edit){

    entry.edit.container = _xyz.utils.createElement({
      tag: 'div',
      style: {
        padding: '4px'
      },
      options: {
        classList: 'table-section expandable'
      }//,
      //appendTo: td
    });

    _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'btn_subtext cursor noselect',
        textContent: 'Isoline settings'
      },
      style: {
        textAlign: 'left',
        fontStyle: 'italic',
        fontSize: 'small'
      },
      appendTo: entry.edit.container,
      eventListener: {
        event: 'click',
        funct: e => {
          if(e) e.stopPropagation();
          _xyz.utils.toggleExpanderParent({
            expandable: entry.edit.container,
            accordeon: true,
            scrolly: _xyz.desktop && _xyz.desktop.listviews
          });
        }
      }
    });


    if(entry.edit.isoline_here && entry.edit.isoline_here.slider){

      if(!entry.ctrl.toggle.checked) td.appendChild(entry.edit.container);

      _xyz.geom.isoline_here_control({
        entry: entry,
        container: entry.edit.container
      });
    }

    if(entry.edit.isoline_mapbox && entry.edit.isoline_mapbox.slider){

      if(!entry.ctrl.toggle.checked) td.appendChild(entry.edit.container);

      _xyz.geom.isoline_mapbox_control({
        entry: entry,
        container: entry.edit.container
      });
    }


  }

};