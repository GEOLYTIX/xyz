export async function toolbar(plugin, mapview) {
    console.log('hello world!');
    console.log(plugin);

    /*
    Note for later: hide button and wait until plugins have all loaded and created ui elements
    mapview.mapButton.style.visiblity = 'hidden';
    */

    const container = mapp.utils.html.node`<div class="core-menu">`;
    document.body.append(container);

    const groups = [];

    console.log(Object.keys(plugin.groups).length);

    for (let i = 0, len = Object.keys(plugin.groups).length; i < len; i++) {
        console.log(Object.keys(plugin.groups)[i]);
        for (const key of Object.keys(plugin.groups)[i]) {
            if (typeof mapp.plugins[key] !== 'function') continue;
            mapp.plugins[key](mapview.locale[key], mapview);
            console.log(`Loaded toolbar group: ${key}`);
        }
    }

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
    console.log(options);
    const sublist = [];

    options.forEach((item) => {
        const this_plugin = document.querySelector(`#mapButton [data-id="${item}"]`);
        const subItem = mapp.utils.html.node`<li>${this_plugin}</li>`;
        sublist.push(subItem);
    });

    return mapp.utils.html`<ul class="submenu display-none">${sublist}`;
}

function group_on_click(e) {
    const container = e.target.closest('.core-menu');
    // find all groups
    const groups = container.querySelectorAll('.submenu');
    // find the clicked group
    const current_group = container.querySelector(
      `li[data-group="${e.target.dataset.group}"] .submenu`,
    );
    // hide current group if shown
    if (!current_group.classList.contains('display-none')) {
      current_group.classList.add('display-none');
      return;
    }
    // hide all groups
    for (const group of groups) {
      group.classList.add('display-none');
    }
    // show only the current one
    current_group.classList.toggle('display-none');
  }