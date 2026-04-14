/**
## Mapview.locate()

@module /mapview/locate

@param {Object} params
The params object argument.
*/

/**
@function locate

@description
The locate method bound to the mapview [this] renders the current location from the Navigator Web API unto the mapview map. 

@param {Object} params Params for the locate method.
*/
export default function locate(params) {
  this._locate ??= {
    feature: new ol.Feature({
      geometry: new ol.geom.Point([0, 0]),
    }),
    icon: {
      scale: 0.05,
      svg: `${this.host}/icons/locator.svg`,
    },
    ...params,
  };

  this._locate.active = !this._locate.active;

  // Create the geolocation marker if it doesn't exist yet.
  if (!this._locate.L) {
    this._locate.L = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [this._locate.feature],
      }),
      style: mapp.utils.style({
        icon: this._locate.icon,
      }),
      zIndex: 999,
    });
  }

  // Remove the geolocation marker if locate is not active.
  if (!this._locate.active) {
    this.Map.removeLayer(this._locate.L);
    return;
  }

  this.Map.addLayer(this._locate.L);

  mapp.utils.getCurrentPosition((pos) => {
    const coords = ol.proj.fromLonLat([
      parseFloat(pos.coords.longitude),
      parseFloat(pos.coords.latitude),
    ]);

    this._locate.feature.getGeometry().setCoordinates(coords);

    // Fly to pos_ll and set flyTo to false to prevent map tracking.
    this.Map.getView().animate({
      center: coords,
      zoom: this.locale.maxZoom,
    });
  });
}
