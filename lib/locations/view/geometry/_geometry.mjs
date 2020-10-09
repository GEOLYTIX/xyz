import _isoline_mapbox from './isoline_mapbox.mjs';

import _isoline_here from './isoline_here.mjs';

import _geometryCollection from './geometryCollection.mjs';

import _draw from './draw.mjs';

export default _xyz => {

  const draw = _draw(_xyz);

  const isoline_here = _isoline_here(_xyz);

  const isoline_mapbox = _isoline_mapbox(_xyz);

  const geometryCollection = _geometryCollection(_xyz);

  return entry => {

    if (entry.query && entry.display) {
      
      return _xyz.query(Object.assign({
        layer: entry.location.layer,
        id: entry.location.id
      },
      entry))
        .then(response => {
          entry.value = response[entry.field]
          createContainers()
          drawGeom()
        })
    }

    createContainers();

    function createContainers() {

      entry.style = Object.assign(
        {},
        entry.location.style,
        entry.style
      );

      entry.container = _xyz.utils.html.node`
      <div 
      class=${'lv-' + (entry.level || 0) + ' ' + (entry.class || '')}
      style="grid-column: 1 / 3; position: relative; display: flex; align-items: center;">`;

      entry.listview.appendChild(entry.container);

      entry.container.appendChild(_xyz.utils.html.node`
        <label class="input-checkbox">
        <input type="checkbox"
        .checked=${(entry.edit && entry.value) || !!entry.display}
        onchange=${e => {

          entry.display = e.target.checked;

          if (entry.display && entry.query) {
            return _xyz.query(Object.assign({
              layer: entry.location.layer,
              id: entry.location.id
            },
            entry))
              .then(response => {
                entry.value = response[entry.field]
                drawGeom()
              })
          }

          if (entry.display && entry.edit) return createGeom(e);

          if (entry.display && !entry.edit) return drawGeom();

          if (!entry.display && entry.edit) {

            if(entry.value && !confirm(_xyz.language.location_geometry_delete_msg)) return e.target.checked = true;

            entry.newValue = null;

            if(entry.edit.edit) {
                entry.edit.edit.remove();
                entry.edit.edit = null;
            }

            if (entry.edit.isoline_here && entry.edit.isoline_here.meta) {

              entry.location.infoj
                .filter(_entry => _entry.type === 'json' && _entry.field === entry.edit.isoline_here.meta)
                .forEach(meta => meta.newValue = null);
            }

            if (entry.edit.isoline_mapbox && entry.edit.isoline_mapbox.meta) {
              entry.location.infoj
                .filter(_entry => _entry.type === 'json' && _entry.field === entry.edit.isoline_mapbox.meta)
                .forEach(meta => meta.newValue = null);
            }

            entry.location.update();
            return
          };

          if (!entry.display && !entry.edit) return hideGeom();

        }}>
        </input>
        <div></div>
        <span>${entry.name || 'Geometry'}<span>`);

      !entry.style.theme && entry.container.appendChild(_xyz.utils.html.node`
        <div class="sample-circle"
        style="${`
          background-color: ${_xyz.utils.Chroma(entry.style.fillColor || entry.style.strokeColor).alpha(entry.style.fillOpacity === undefined ? 1 : (parseFloat(entry.style.fillOpacity) || 0))};
          border-color: ${_xyz.utils.Chroma(entry.style.color || entry.style.strokeColor).alpha(1)};
          border-style: solid;
          border-width: ${entry.style.strokeWidth || 1}px;
          margin-left: auto;`}">`);
    }

    function drawGeom() {

      if (entry.value.type === 'FeatureCollection') {

        geometryCollection(entry);

      } else {

        entry.geometry = entry.value && _xyz.mapview.geoJSON({
          geometry: typeof entry.value === 'object' && entry.value || JSON.parse(entry.value),
          dataProjection: '4326',
          zIndex: entry.location.layer.L.getZIndex() - 1,
          style: new ol.style.Style({
            stroke: entry.style.strokeColor && new ol.style.Stroke({
              color: _xyz.utils.Chroma(entry.style.color || entry.style.strokeColor).alpha(1),
              width: entry.style.strokeWidth || 1,
              lineDash: entry.style.lineDash
            }),
            fill: new ol.style.Fill({
              color: _xyz.utils.Chroma(entry.style.fillColor || entry.style.strokeColor).alpha(entry.style.fillOpacity === undefined ? 1 : parseFloat(entry.style.fillOpacity) || 0).rgba()
            })
          })
        });

        entry.geometry && entry.location.geometries.push(entry.geometry);
        entry.display = true;
      }
    }

    function hideGeom() {

      entry.display = false;

      if (entry.legend) entry.legend.remove();

      entry.value.type === 'FeatureCollection' ?
        entry.location.geometries.splice(entry.location.geometries.indexOf(entry.geometryCollection), 1) && entry.location.geometryCollection.map(f => _xyz.map.removeLayer(f)) :
        entry.geometry && entry.location.geometries.splice(entry.location.geometries.indexOf(entry.geometry), 1) && _xyz.map.removeLayer(entry.geometry);
    }

    function createGeom(e) {

      if (!entry.edit) return;

      if (entry.edit.isoline_mapbox) return isoline_mapbox.create(entry);

      if (entry.edit.isoline_here) return isoline_here.create(entry);

      if(e) {
        e.target.checked = false;
        entry.display = e.target.checked;
        return alert("This geometry doesn't exist. Create it first.");  
      }
    }

    entry.edit
      && entry.edit.isoline_mapbox
      && entry.container.parentNode.insertBefore(isoline_mapbox.settings(entry), entry.container.nextSibling);

    entry.edit
      && entry.edit.isoline_here
      && entry.container.parentNode.insertBefore(isoline_here.settings(entry), entry.container.nextSibling);

    entry.edit
      && entry.edit.polygon 
      && entry.container.parentNode.appendChild(draw.polygon(entry));

    entry.edit 
      && entry.edit.rectangle
      && entry.container.parentNode.appendChild(draw.rectangle(entry));

    entry.edit 
      && entry.edit.circle
      && entry.container.parentNode.appendChild(draw.circle(entry));

    entry.edit 
      && entry.edit.line
      && entry.container.parentNode.appendChild(draw.line(entry));

    entry.edit 
      && entry.edit.freehand
      && entry.container.parentNode.appendChild(draw.freehand(entry));

    if (entry.value && (entry.display || entry.edit)) return drawGeom();

    if (!entry.value && entry.display) createGeom();

  };

}