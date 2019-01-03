// if ( window.history.replaceState ) {
//   window.history.replaceState( null, null, window.location.href );
// }


let one = new __xyz({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map1',
  locale: 'NE',
  view_lat: 40.74,
  view_lng: -73.98,
  view_zoom: 2,
  next: () => console.log(one)
});

console.log(one);

let two = new __xyz({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map2',
  locale: 'Offices',
  view_lat: 51.52,
  view_lng: 0.24,
  view_zoom: 2,
  next: () => console.log(two)
});

console.log(two);


// function init() {

//   let layer = _xyz.layers.list['grid'];
//   layer.display = true;
//   layer.get();

//   let layer = _xyz.layers.list['oa'];
//   layer.style.theme = layer.style.themes['Population \'11'];
//   layer.loaded = false;
//   layer.get();

//   _xyz.locate.toggle();

// }

