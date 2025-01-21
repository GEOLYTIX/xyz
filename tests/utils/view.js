const views = {
  default: {
    lat: '0',
    long: '-7.081154551613622e-10',
  },
  london: {
    lat: '-14035.161399215933',
    long: '6708600.902178298',
  },
  sandton: {
    lat: '3123319.665346',
    long: '-3012437.111737',
  },
};

export async function setView(mapview, z, view) {
  await mapview.Map.getView().setZoom(z);
  await mapview.Map.getView().setCenter([views[view].lat, views[view].long]);
}
