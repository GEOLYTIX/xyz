export function toolbar(plugin, mapview) {
  console.log('hello world!');
  console.log(plugin);

  /*
  Note for later: hide button and wait until plugins have all loaded and created ui elements
  mapview.mapButton.style.visiblity = 'hidden';
  */

  const container = mapp.utils.html.node`<div class="core-menu">`;
  document.body.append(container);

  const groups = [];

  Object.entries(plugin.groups).map(item => {
    const sublist = create_submenu(item[1].buttons);

    item[1].icon ??= 'construction';

    const title = item[1].title || item[0];

    const group = mapp.utils.html.node`<li data-group="${item[0]}">
      <button onclick="${group_on_click}" data-group=${item[0]} title=${title}>
        <span class="material-symbols-outlined">${item[1].icon}</span>
      </button>
      ${sublist}
    </li>`;
    groups.push(group);
  });

  mapp.utils.render(container, mapp.utils.html`<ul>${groups}`);
}

function create_submenu(options) {
  const sublist = [];

  options.forEach((item) => {
    const subItem = mapp.utils.html.node`<li><button>${item}</button></li>`;
    sublist.push(subItem);
  });

  return mapp.utils.html`<ul>${sublist}`;
}

function group_on_click(e) {
  const container = e.target.closest('.core-menu');
  const submenus = container.querySelectorAll('.submenu');

  for (const submenu of submenus) {
    container.contains(submenu)
      ? submenu.classList.toggle('display-none')
      : submenu.classList.add('display-none');
  }
}