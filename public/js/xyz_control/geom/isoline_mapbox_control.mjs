export default _xyz => param => {

  param.entry.edit.isoline_mapbox.profile = param.entry.edit.isoline_mapbox.profile || 'driving';
  param.entry.edit.isoline_mapbox.minutes = param.entry.edit.isoline_mapbox.minutes || 10;

  let mode_container = _xyz.utils.createElement({
    tag: 'div',
    style: {
      marginTop: '8px'
    },
    appendTo: param.container
  });

  _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: 'Mode'
    },
    appendTo: mode_container
  });

  _xyz.utils.dropdown({
    //title: 'Mode',
    label: 'label',
    val: 'val',
    selected: param.entry.edit.isoline_mapbox.profile,
    style: {
      width: '70%',
      float: 'right',
      margin: 0
    },
    entries: [
      {
        label: 'Driving',
        val: 'driving'
      },
      {
        label: 'Walking',
        val: 'walking'
      },
      {
        label: 'Cycling',
        val: 'cycling'
      }
    ],
    onchange: e => {
      param.entry.edit.isoline_mapbox.profile = e.target.value;
    },
    appendTo: mode_container
  });

  const slider_mapbox_minutes = _xyz.utils.createElement({
    tag: 'div',
    style: {
      marginTop: '12px'
    },
    appendTo: param.container
  });

  _xyz.utils.slider({
    title: 'Travel time in minutes: ',
    default: param.entry.edit.isoline_mapbox.minutes,
    min: 5,
    max: 60,
    value: param.entry.edit.isoline_mapbox.minutes,
    appendTo: slider_mapbox_minutes,
    oninput: e => {
      param.entry.edit.isoline_mapbox.minutes = parseInt(e.target.value);
      e.target.parentNode.previousSibling.textContent = param.entry.edit.isoline_mapbox.minutes;
    }
  });

};