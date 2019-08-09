export default _xyz => {

  return {

    init: init,

    add: add,

  };


  function init(params) {

    if (_xyz.mobile) {
      _xyz.mobile.tabLocations.classList.add('displaynone');
      _xyz.mobile.activateLayersTab();
    }

    // Clear locations button to remove hooks and reset location listview.
    if (params.clear){

      _xyz.locations.listview.clear = params.clear;
    
      _xyz.locations.listview.clear.onclick = () => {
        _xyz.hooks.remove('locations');

        _xyz.locations.list.forEach(record => {

          if (record.location) record.location.remove(); //_xyz.locations.remove(record.location);

        });
      };
    }
    
    _xyz.locations.listview.node = params.target;

    // Hide the Locations Module.
    _xyz.locations.listview.node.parentElement.style.display = 'none';
    
    // Empty the locations list.
    _xyz.locations.listview.node.innerHTML = '';
      
    _xyz.locations.list = [
      {
        letter: 'A',
        style: {
          color: '#9c27b0'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'B',
        style: {
          color: '#2196f3'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'C',
        style: {
          color: '#009688'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'D',
        style: {
          color: '#cddc39'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'E',
        style: {
          color: '#ff9800'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'F',
        style: {
          color: '#673ab7'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'G',
        style: {
          color: '#03a9f4'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'H',
        style: {
          color: '#4caf50'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'I',
        style: {
          color: '#ffeb3b'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'J',
        style: {
          color: '#ff5722'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'K',
        style: {
          color: '#0d47a1'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'L',
        style: {
          color: '#00bcd4'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'M',
        style: {
          color: '#8bc34a'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'N',
        style: {
          color: '#ffc107'
        },
        stamp: parseInt(Date.now()),
      },
      {
        letter: 'O',
        style: {
          color: '#d32f2f'
        },
        stamp: parseInt(Date.now()),
      }
    ];
         
  };


  function add(location) {

    if(!_xyz.locations.listview.node) return;

    _xyz.locations.listview.node.parentElement.style.display = 'block';
  
    Object.values(_xyz.locations.listview.node.children).forEach(el => el.classList.remove('expanded'));
  


    // location.style = Object.assign(
    //   {},
    //   _xyz.layers.list[location.layer].style,
    //   {
    //     color: record.color,
    //     fillColor: record.color,
    //     letter: record.letter,
    //     stroke: true,
    //     fill: true,
    //     fillOpacity: (_xyz.layers.list[location.layer].style.default && _xyz.layers.list[location.layer].style.default.fillOpacity === undefined) ? 0 : 0.2,
    //     icon: {
    //       url: _xyz.utils.svg_symbols({
    //         type: 'circle',
    //         style: {
    //           color: '#090',
    //           opacity: '0'
    //         }
    //       }),
    //       size: 40
    //     }
    //   }
    // );

    // // Set marker coordinates from point geometry.
    // if (location.geometry.type === 'Point') location.marker = location.geometry.coordinates;


    // // Draw letter marker.
    // location.Marker = _xyz.mapview.geoJSON({
    //   json: {
    //     type: 'Feature',
    //     geometry: {
    //       type: 'Point',
    //       coordinates: location.marker || _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates,
    //     }
    //   },
    //   pane: 'select_marker',
    //   style: {
    //     icon: {
    //       url: _xyz.utils.svg_symbols({
    //         type: 'markerLetter',
    //         style: {
    //           letter: record.letter,
    //           color: record.color,
    //         }
    //       }),
    //       size: 40,
    //       anchor: [20, 40]
    //     }
    //   }
    // });


    // if (location._flyTo) location.flyTo();
  

  
    
    _xyz.locations.listview.node.insertBefore(location.view.drawer, _xyz.locations.listview.node.firstChild);
  
    if (_xyz.desktop) setTimeout(() => {
      _xyz.desktop.listviews.scrollTop = _xyz.desktop.listviews.clientHeight;
    }, 500);
  
    // Make select tab active on mobile device.
    if (_xyz.mobile) _xyz.mobile.activateLocationsTab();

  }

};