window.onload = () => {

  const xyz = _xyz({
    host: '/coop'
  })

  xyz.workspace.get.locale({
    locale: 'api'
  }).then(locale => {

    xyz.locale = locale

    xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      zoomControl: true
    });

    locale.layers.forEach(layer => {

      xyz.workspace.get.layer({
        locale: locale.key,
        layer: layer
      }).then(layer => {
        layer = xyz.layers.decorate(layer);
        xyz.layers.list[layer.key] = layer;
        layer.display && layer.show()
      })
     
    })

    const Location = document.getElementById('Location');
  
    xyz.gazetteer.init({
      group: document.getElementById('Gazetteer'),
      callback: feature => {
  
        const xhr = new XMLHttpRequest();
  
        xhr.open('GET', `${xyz.host}/api/query/select_ll?lng=${feature.coordinates[0]}&lat=${feature.coordinates[1]}`)
    
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';
        xhr.onload = e => {
  
          const response = e.target.response;
  
          delete response.geomj;
  
  
          Location.innerHTML = '';
    
          Location.appendChild(xyz.utils.wire()`
          <textarea
          value=${JSON.stringify(response, undefined, 2)}
          rows=25>`)
    
        };
    
        xhr.send();
      }
    });
  
    xyz.locations.selectCallback = location => {
  
      location.draw();
  
      Location.innerHTML = '';
  
      location.view = xyz.locations.view.infoj(location);
  
      Location.appendChild(location.view);
    }

  })

}