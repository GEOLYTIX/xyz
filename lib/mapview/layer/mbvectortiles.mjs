export default _xyz => layer => {

  layer.L = new ol.layer.MapboxVector({
    styleUrl: layer.mbStyle,
    accessToken: layer.accessToken,
  })

}