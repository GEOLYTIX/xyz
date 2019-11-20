export default _xyz => entry => {
  
  const chk = entry.edit.options.find(
    option => typeof option === 'object' && Object.values(option)[0] === entry.value || option === entry.value
  ) || entry.value

  entry.displayValue = typeof chk === 'object' && Object.keys(chk)[0] || chk || entry.value;

  entry.val.appendChild(_xyz.utils.wire()`
  <button class="btn-drop">
  <div
    class="head"
    onclick=${e => {
      e.preventDefault();
      e.target.parentElement.classList.toggle('active');
    }}>
    <span>${entry.displayValue}</span>
    <div class="icon"></div>
  </div>
  <ul>
    ${entry.edit.options.map(
      option => {

        let key = option;
        let value = option;

        if (typeof option === 'object') {
          key = Object.keys(option)[0];
          value = Object.values(option)[0];
        }
        
        return _xyz.utils.wire()`
        <li onclick=${e=>{
          const drop = e.target.closest('.btn-drop');
          drop.classList.toggle('active');
          drop.querySelector(':first-child').textContent = key;
          drop.querySelector(':first-child').value = value;

          entry.location.view.dispatchEvent(
            new CustomEvent('valChange', {detail:{
              input: drop.querySelector(':first-child'),
              entry: entry
            }}))
        }}>${key}`
    })}`);

};