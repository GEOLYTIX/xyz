import { wire } from 'hyperhtml/esm';

export function dropdownCustom(param) {

  const node = wire()`<div class="ul-drop">`;

  node.appendChild(wire()`
  <div
    class="head"
    onclick=${toggleMenu}><span>
      ${param.placeholder || 'Select...'}`);

  function toggleMenu(e) {
    e.stopPropagation();
    node.classList.toggle('active');
    if (!param.singleSelect && node.classList.contains('active')) return document.body.addEventListener('click', toggleMenu);
    document.body.removeEventListener('click', toggleMenu);
  }

  const menu = wire()`<ul>`;

  node.appendChild(menu);

  param.entries.forEach(entry => {

    menu.appendChild(wire()`
    <li
      onclick=${selectOption}
      data-field=${typeof (entry) == 'object' ? Object.keys(entry)[0] : entry}>
        ${typeof (entry) == 'object' ? Object.values(entry)[0] : entry}`);

    function selectOption(e) {

      if(param.singleSelect){
        for(let i =0; i < menu.children.length; i++){
          menu.children[i].classList.remove('selected');
        }
      }
      e.target.classList.toggle('selected');
      node.classList.toggle('active');
      if (param.callback) param.callback(e);
    }

  });

  if(!isNaN(param.selectedIndex)){
    node.querySelector('.head span').textContent = menu.children[param.selectedIndex].textContent;
    menu.children[param.selectedIndex].classList.add('selected');
  }

  return node;
}