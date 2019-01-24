export default (_xyz, layer) => {
        
  // set defaults
  layer.edit.isoline = {
    type: 'fastest',
    rangetype: 'time'
  };

  let block = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'block',
      padding: '5px'
    },
    appendTo: layer.edit.panel
  });

  var row = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'block'
    },
    appendTo: block
  });

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: 'Transport mode'
    },
    style: {
      display: 'inline-block',
      width: '48%'
    },
    appendTo: row
  });

  _xyz.utils.dropdown({
    style: {
      width: '50%',
      display: 'inline-block'
    },
    label: 'label',
    val: 'val',
    entries: [
      {
        label: 'Driving',
        val: 'car'
      },
      {
        label: 'Walking',
        val: 'pedestrian'
      }/*,
              {
                label: 'Public transport',
                val: 'publicTransport'
              },
              {
                label: 'Public transport live',
                val: 'publicTransportTimetable'
              }*/,
      {
        label: 'Cargo',
        val: 'truck'
      },
      {
        label: 'HOV lane',
        val: 'carHOV'
      }/*,
              {
                label: "Cycling",
                val: 'bicycle'
              }*/
    ],
    onchange: e => {
      layer.edit.isoline.mode = e.target.value;
    },
    appendTo: row
  });
        
  row = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'block'
    },
    appendTo: block
  });
          
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: 'Routing type'
    },
    style: {
      display: 'inline-block',
      width: '48%'
    },
    appendTo: row
  });
        
  _xyz.utils.dropdown({
    style: {
      width: '50%',
      display: 'inline-block'
    },
    label: 'label',
    val: 'val',
    entries: [
      {
        label: 'Fastest',
        val: 'fastest'
      },
      {
        label: 'Shortest',
        val: 'shortest'
      }
    ],
    onchange: e => {
      layer.edit.isoline.type = e.target.value;
    },
    appendTo: row
  });
        
  row = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'block'
    },
    appendTo: block
  });
        
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: 'Range type'
    },
    style: {
      display: 'inline-block',
      width: '48%'
    },
    appendTo: row
  });
        
  _xyz.utils.dropdown({
    style: {
      width: '50%',
      display: 'inline-block'
    },
    label: 'label',
    val: 'val',
    entries: [
      {
        label: 'Time (min)',
        val: 'time'
      },
      {
        label: 'Distance (km)',
        val: 'distance'
      }/*,
              {
                label: 'Consumption',
                val: 'consumption'
              }*/
    ],
    onchange: e => {
      layer.edit.isoline.rangetype = e.target.value;
    },
    appendTo: row
  });
        
  /*_xyz.utils.checkbox({
            label: 'Use live traffic data',
            onChange: e => {
                layer.edit.isoline.traffic = e.target.checked;
                console.log('if this is checked select departure time');
                // public transport not supported by isolines endpoint
            },
            appendTo: block
        });*/
        
  _xyz.utils.slider({
    title: 'Range of isoline: ',
    min: 1, // 3 mins or 3 km
    max: 60, // 60 mins or 60 km
    default: 5,
    value: 10,
    appendTo: block,
    oninput: e => {
      layer.edit.isoline.range = parseInt(e.target.value);
      e.target.parentNode.previousSibling.textContent = layer.edit.isoline.range;
    }
  });
};