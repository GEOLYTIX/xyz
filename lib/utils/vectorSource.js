export default {
  cluster
}

function cluster(layer) {
  const clusterSource = new ol.source.Cluster({
    distance: layer.vectorSource.distance || 50,
    source: layer.L.getSource(),
  })

  layer.L.setSource(clusterSource)
}