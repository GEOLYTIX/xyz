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
    icon: {
      svg: `${this.host}/icons/locator.svg`,
      scale: 0.05,
    },
    feature: new ol.Feature({
      geometry: new ol.geom.Point([0, 0]),
    }),
    ...params,
  };

  this._locate.active = !this._locate.active;

  // Create the geolocation marker if it doesn't exist yet.
  if (!this._locate.L) {
    this._locate.L = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [this._locate.feature],
      }),
      zIndex: 999,
      style: mapp.utils.style({
        icon: this._locate.icon,
      }),
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
