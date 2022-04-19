let active;

export default function (params) {

  const locate = Object.assign({
    icon: {
      svg: `${this.host}/icons/locator.svg`,
      scale: 0.05
    },
    feature: new ol.Feature({
      geometry: new ol.geom.Point([0, 0])
    }),
  }, params)

  active = !active

  // Create the geolocation marker if it doesn't exist yet.
  if (!locate.L) {

    locate.L = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [locate.feature]
      }),
      zIndex: 40,
      style: mapp.utils.style({
        icon: locate.icon
      })
    })
  }

  // Remove the geolocation marker if locate is not active.
  if (!active) {
    this.Map.removeLayer(locate.L)
    return;
  }

  this.Map.addLayer(locate.L)

  mapp.utils.getCurrentPosition((pos) => {

    const coords = ol.proj.fromLonLat([
      parseFloat(pos.coords.longitude),
      parseFloat(pos.coords.latitude)
    ])

    locate.feature.getGeometry().setCoordinates(coords)

    // Fly to pos_ll and set flyTo to false to prevent map tracking.
    this.Map.getView().animate({
      center: coords
    }, {
      zoom: this.locale.maxZoom
    })
  })

}