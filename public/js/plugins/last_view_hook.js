document.dispatchEvent(new CustomEvent('last_view_hook', {
  detail: _xyz => {

    const history = []

    _xyz.mapview.node.addEventListener('changeEnd', () => {

      const center = ol.proj.transform(
        _xyz.map.getView().getCenter(),
        'EPSG:' + _xyz.mapview.srid,
        'EPSG:4326')

      history.push({
        lat: center[1],
        lng: center[0],
        z: _xyz.map.getView().getZoom()
      })

    })

    document.getElementById('mapButton').insertBefore(_xyz.utils.html.node`
      <button
      class="mobile-display-none"
        title="Set previous map view"
        onclick=${e => {
          
          e.stopPropagation()

          history.length && history.pop()

          if (!history.length) return

          const view = _xyz.map.getView()

          const lastView = history[history.length - 1]

          const center =  ol.proj.fromLonLat([lastView.lng, lastView.lat])

          view.animate({
            center: center,
            zoom: lastView.z
          })
      
        }}><div class="xyz-icon icon-reply off-black-filter">`,
        document.getElementById('btnZoomIn'))   

  }
}))