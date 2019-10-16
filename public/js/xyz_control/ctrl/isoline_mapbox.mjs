export default _xyz => param => {

  param.entry.edit.isoline_mapbox.profile = param.entry.edit.isoline_mapbox.profile || 'driving';
  param.entry.edit.isoline_mapbox.minutes = param.entry.edit.isoline_mapbox.minutes || 10;

  const mode_container = _xyz.utils.wire()`<div style="margin-top: 8px;">`;

  param.container.appendChild(mode_container);

  mode_container.appendChild(_xyz.utils.wire()`<div style="display: inline-block; width: 20%;">Mode`);

  const setting_container = _xyz.utils.wire()`<div style="display: inline-block; width: 80%;">`;

  mode_container.appendChild(setting_container);

  setting_container.appendChild(_xyz.utils.dropdownCustom({
    entries: [ {"driving": "Driving"},
    {"walking": "Walking"},
    {"cycling": "Cycling" }],
    singleSelect: true,
    selectedIndex: 0,
    callback: e => {
      param.entry.edit.isoline_mapbox.profile = e.target.dataset.field;
      e.target.parentNode.previousSibling.textContent = e.target.textContent;
    }
  }));

  param.container.appendChild(_xyz.utils.wire()`
  <div style="margin-top: 12px;">
  <span>Travel time in minutes: </span>
  <span class="bold">${param.entry.edit.isoline_mapbox.minutes}</span>
  <div class="range">
  <input
    type="range"
    min=5
    value=${param.entry.edit.isoline_mapbox.minutes}
    max=60
    step=1
    oninput=${e=>{
    param.entry.edit.isoline_mapbox.minutes = parseInt(e.target.value);
    e.target.parentNode.previousElementSibling.textContent = param.entry.edit.isoline_mapbox.minutes;
  }}>`);

};