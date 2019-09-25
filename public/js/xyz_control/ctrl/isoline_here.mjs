export default _xyz => param => {

  console.log(param.container);

  const mode_container = _xyz.utils.wire()`<div style="margin-top: 8px">`;

  param.container.appendChild(mode_container);

  mode_container.appendChild(_xyz.utils.wire()`<span>Mode`);

  _xyz.utils.dropdown({
    label: 'label',
    val: 'val',
    selected: param.entry.edit.isoline_here.mode || 'car',
    style: {
      width: '70%',
      float: 'right',
      margin: 0
    },
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
    appendTo: mode_container
  });

  let range_container = _xyz.utils.wire()`<div style="margin-top: 8px;"><span>Range`;

  param.container.appendChild(range_container);

  _xyz.utils.dropdown({
    label: 'label',
    val: 'val',
    selected: param.entry.edit.isoline_here.rangetype || 'time',
    style: {
      width: '70%',
      float: 'right',
      margin: 0
    },
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

      const input = slider_here_range.querySelector('input');

      if (e.target.value === 'time') {

        slider_here_range.querySelector('span').textContent = 'Travel time in minutes: ';

        input.oninput = e => {
          param.entry.edit.isoline_here.minutes = parseInt(e.target.value);
          e.target.parentNode.previousElementSibling.textContent = param.entry.edit.isoline_here.minutes;
        };
        input.value = param.entry.edit.isoline_here.minutes;
        input.parentNode.previousElementSibling.textContent = param.entry.edit.isoline_here.minutes;

      }

      if (e.target.value === 'distance') {

        slider_here_range.querySelector('span').textContent = 'Travel distance in kilometer: ';

        input.oninput = e => {
          param.entry.edit.isoline_here.distance = parseInt(e.target.value);
          e.target.parentNode.previousElementSibling.textContent = param.entry.edit.isoline_here.distance;
        };
        input.value = param.entry.edit.isoline_here.distance;
        input.parentNode.previousElementSibling.textContent = param.entry.edit.isoline_here.distance;

      }

    },
    appendTo: range_container
  });

  param.entry.edit.isoline_here.minutes = param.entry.edit.isoline_here.minutes || 10;

  param.entry.edit.isoline_here.distance = param.entry.edit.isoline_here.distance || 10;

  const slider_here_range = _xyz.utils.wire()`
  <div style="margin-top: 12px;">
  <span>Travel time in minutes: </span>
  <span class="bold">${param.entry.edit.isoline_here.minutes}</span>
  <div class="range">
  <input
    type="range"
    min=5
    value=${param.entry.edit.isoline_here.minutes}
    max=60
    step=1
    oninput=${e=>{
    param.entry.edit.isoline_here.minutes = parseInt(e.target.value);
    e.target.parentNode.previousElementSibling.textContent = param.entry.edit.isoline_here.minutes;
  }}>`;

  param.container.appendChild(slider_here_range);

};