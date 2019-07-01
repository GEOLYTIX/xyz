import { wire } from 'hyperhtml/esm';

export function dropdownCustom(param) {

  const node = wire()`<div class="ul-drop">`;

  node.appendChild(wire()`
  <div
    class="head"
    onclick=${toggleMenu}>
      ${param.placeholder || 'Select...'}`);

  function toggleMenu(e) {
    e.stopPropagation();
    node.classList.toggle('active');
    if (node.classList.contains('active')) return document.body.addEventListener('click', toggleMenu);
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
      e.target.classList.toggle('selected');
      if (param.callback) param.callback(e);
    }

  });

  return node;
}