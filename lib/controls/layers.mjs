export default function layers(layers) {
  // Create layers listview.
  mapp.ui.layers.listview({
    target: layers.target,
    layers: layers.mapview.layers,
  });
}
