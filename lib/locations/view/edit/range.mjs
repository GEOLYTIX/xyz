export default _xyz => entry => {

  entry.val.appendChild(_xyz.utils.wire()`
  <div>
  <span>${entry.edit.range.label}</span>
  <span class="bold">${entry.value}</span>
  <div class="input-range">
  <input
    class="secondary-colour-bg"
    type="range"
    min=${entry.edit.range.min}
    value=${entry.value}
    max=${entry.edit.range.max}
    oninput=${e=>{
    e.target.parentNode.previousElementSibling.textContent = e.target.value;
  }}>`);

};