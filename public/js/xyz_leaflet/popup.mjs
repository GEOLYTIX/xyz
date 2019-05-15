export default _xyz => params => {

  if (!params || !params.latlng || !params.content) return;

  _xyz.L.popup({ closeButton: false })
    .setLatLng(params.latlng)
    .setContent(params.content)
    .openOn(_xyz.map);

};