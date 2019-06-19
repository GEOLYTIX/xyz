export default _xyz => params => {

  if (!params || !params.latlng || !params.content) return;

  _xyz.mapview.lib.popup({ closeButton: false })
    .setLatLng(params.latlng)
    .setContent(params.content)
    .openOn(_xyz.map);

};