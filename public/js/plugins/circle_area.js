document.dispatchEvent(new CustomEvent('circle_area', {
  detail: _xyz => {

    _xyz.layers.plugins.circle_area = async layer => {

      layer.edit.circle_area = {
        radius: 1
      }

      const panel = layer.view.querySelector('.panel')

      panel.appendChild(_xyz.utils.html.node `<button
              class="btn-wide primary-colour"
              onclick=${e => {

                e.stopPropagation();

                const btn = e.target;
                if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel();
                btn.classList.add('active');
                layer.show();
                layer.view.querySelector('.header').classList.add('edited', 'secondary-colour-bg')

                _xyz.mapview.interaction.draw.begin({
                  layer: layer,
                  type: 'Point',
                  update: () => {

                    const features = _xyz.mapview.interaction.draw.Layer.getSource().getFeatures()

                    const geom_p = ol.proj.transform(features[0].getGeometry().getCoordinates(), `EPSG:${_xyz.mapview.srid}`, 'EPSG:4326')

                    let _geometry = _xyz.utils.turf.circle(
                      geom_p, 
                      layer.edit.circle_area.radius, 
                      {steps: 33, units: 'miles'})

                    const feature = new ol.format.GeoJSON().readFeature({
                      type: 'Feature',
                      geometry: _geometry.geometry,
                    },{ 
                      dataProjection: 'EPSG:4326',
                      featureProjection: `
        EPSG: $ {
          _xyz.mapview.srid
        }
        `
                    });

                    const xhr = new XMLHttpRequest();

                    xhr.open('POST', _xyz.host +
                      '/api/location/new?' +
                      _xyz.utils.paramString({
                        locale: _xyz.locale.key,
                        layer: layer.key,
                        table: layer.table
                      }));

                    xhr.setRequestHeader('Content-Type', 'application/json');

                    xhr.onload = e => {
                      if (e.target.status !== 200) return;

                      _xyz.mapview.interaction.draw.layer.reload();
                      
                      _xyz.locations.select({
                        layer: layer,
                        table: layer.table,
                        id: e.target.response
                      });
                    
                    }
                    
                    xhr.send(JSON.stringify({
                      geometry: {
                        type: "Polygon",
                        coordinates: feature.getGeometry().getCoordinates()
                      }
                    }))

                    _xyz.mapview.interaction.draw.cancel();
                    
                  },
                  callback: () => {
                    layer.view.querySelector('.header').classList.remove('edited', 'secondary-colour-bg');
                    btn.classList.remove('active');
                  }
                });

              }}
            >Radius`)

      panel.appendChild(makeSlider({
        title: 'Set radius in mi:',
        range: 1,
        callback: e => {
          layer.edit.circle_area.radius = e.target.value
        }
      }))

    }

    function makeSlider(params) {
      return _xyz.utils.html.node `
          <div style="margin-top: 12px; grid-column: 1 / 3;"
          <span>${params.title}</span>
          <span class="bold">${params.range}</span>
          <div class="input-range">
          <input class="secondary-colour-bg"
          type="range"
          min=0.5
          value=${params.range}
          max=3
          step=0.5
          oninput=${e=> {
            e.target.parentNode.previousElementSibling.textContent = e.target.value
            if(params.callback) params.callback(e)
          }}>`
    }
  }
}))