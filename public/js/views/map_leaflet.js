// if ( window.history.replaceState ) {
//   window.history.replaceState( null, null, window.location.href );
// }


// let _this = new _xyz.Map({
//   host: document.head.dataset.dir,
//   //token: API token,
//   map_id: 'xyz_map1',
//   locale: 'NE',
//   view_lat: 40.74,
//   view_lng: -73.98,
//   view_zoom: 2,
//   next: () => console.log(_this)
// });

// Object.assign(_xyz, _this);

// console.log(_xyz);

let _xyz1 = _xyz.init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map1',
  locale: 'NE',
  view_lat: 40.74,
  view_lng: -73.98,
  view_zoom: 2,
  //next: next1(map)
});

function next1(map) {
  let _xyz1 = Object.assign(_xyz, map);
  console.log(_xyz1);
}


let _xyz2 = _xyz.init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map2',
  locale: 'Offices',
  view_lat: 51.52,
  view_lng: 0.24,
  view_zoom: 2,
  //next: next2(map)
});

function next2(map) {
  let _xyz2 = Object.assign(_xyz, map);
  console.log(_xyz2);
}




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