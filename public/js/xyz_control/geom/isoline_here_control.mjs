export default _xyz => param => {

	_xyz.utils.dropdown({
      title: 'Mode',
      label: 'label',
      val: 'val',
      selected: param.entry.edit.isoline_here.mode || 'car',
      entries: [
        {
          label: 'Driving',
          val: 'car'
        },
        {
          label: 'Walking',
          val: 'pedestrian'
        },
        {
          label: 'Cargo',
          val: 'truck'
        },
        {
          label: 'HOV lane',
          val: 'carHOV'
        },
      ],
      onchange: e => {
        param.entry.edit.isoline_here.mode = e.target.value;
      },
      appendTo: param.container
    });

    _xyz.utils.dropdown({
      title: 'Range',
      label: 'label',
      val: 'val',
      selected: param.entry.edit.isoline_here.rangetype || 'time',
      entries: [
        {
          label: 'Time (min)',
          val: 'time'
        },
        {
          label: 'Distance (km)',
          val: 'distance'
        }
      ],
      onchange: e => {

        param.entry.edit.isoline_here.rangetype = e.target.value;

        if (e.target.value === 'time') {

          slider_here_minutes.style.display = 'block';
          slider_here_distance.style.display = 'none';

        }

        if (e.target.value === 'distance') {

          slider_here_minutes.style.display = 'none';
          slider_here_distance.style.display = 'block';

        }

      },
      appendTo: param.container
    });

    param.entry.edit.isoline_here.minutes = param.entry.edit.isoline_here.minutes || 10;

    const slider_here_minutes = _xyz.utils.createElement({
      tag: 'div',
      appendTo: param.container
    });

    _xyz.utils.slider({
      title: 'Travel time in minutes: ',
      default: param.entry.edit.isoline_here.minutes,
      min: 5,
      max: 60,
      value: param.entry.edit.isoline_here.minutes,
      appendTo: slider_here_minutes,
      oninput: e => {
        param.entry.edit.isoline_here.minutes = parseInt(e.target.value);
        e.target.parentNode.previousSibling.textContent = param.entry.edit.isoline_here.minutes;
      }
    });

    param.entry.edit.isoline_here.distance = param.entry.edit.isoline_here.distance || 10;

    const slider_here_distance = _xyz.utils.createElement({
      tag: 'div',
      style: {
        display: 'none'
      },
      appendTo: param.container
    });

    _xyz.utils.slider({
      title: 'Travel distance in kilometer: ',
      default: param.entry.edit.isoline_here.distance,
      min: 5,
      max: 60,
      value: param.entry.edit.isoline_here.distance,
      appendTo: slider_here_distance,
      oninput: e => {
        param.entry.edit.isoline_here.distance = parseInt(e.target.value);
        e.target.parentNode.previousSibling.textContent = param.entry.edit.isoline_here.distance;
      }
    });

}