export default _xyz => param => {

	param.entry.edit.isoline_mapbox.profile = param.entry.edit.isoline_mapbox.profile || 'driving';
	param.entry.edit.isoline_mapbox.minutes = param.entry.edit.isoline_mapbox.minutes || 10;

	_xyz.utils.dropdown({
      title: 'Mode',
      label: 'label',
      val: 'val',
      selected: param.entry.edit.isoline_mapbox.profile,
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
      appendTo: param.container
    });

    _xyz.utils.slider({
      title: 'Travel time in minutes: ',
      default: param.entry.edit.isoline_mapbox.minutes,
      min: 5,
      max: 60,
      value: param.entry.edit.isoline_mapbox.minutes,
      appendTo: param.container,
      oninput: e => {
        param.entry.edit.isoline_mapbox.minutes = parseInt(e.target.value);
        e.target.parentNode.previousSibling.textContent = param.entry.edit.isoline_mapbox.minutes;
      }
    });

}