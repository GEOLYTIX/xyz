export async function toolbar(plugin, mapview) {
  mapview.mapButton ??= document.getElementById('mapButton');

  const container = mapp.utils.html.node`<div class="core-menu">`;
  document.body.append(container);

  const groups = [];

  for (let i = 0, len = Object.keys(plugin.groups).length; i < len; i++) {
    for (const key of Object.keys(plugin.groups)[i]) {
      if (typeof mapp.plugins[key] !== 'function') continue;
      mapp.plugins[key](mapview.locale[key], mapview);
      console.log(`Loaded toolbar group: ${key}`);
    }
  }

  Object.entries(plugin.groups).map((item) => {
    const sublist = create_submenu({
      plugin,
      mapview,
      options: item[1].buttons,
    });

    item[1].icon ??= 'apps';

    const title = item[1].title || item[0];

    const group = mapp.utils.html.node`<li data-group="${item[0]}">
      <span class="material-symbols-outlined state-icon"></span>
      <button class="group hexagon" onclick="${group_on_click}" data-group=${item[0]} title=${title}>
        <span class="material-symbols-outlined">${item[1].icon}</span>
      </button>
      ${sublist}
    </li>`;
    groups.push(group);
  });

  mapp.utils.render(container, mapp.utils.html`<ul>${groups}`);

  // hide default map toolbar if it has no child nodes left
  if (!mapview.mapButton.firstChild) {
    mapview.mapButton.style.visibility = 'hidden';
  }
}

/**
Creates a submenu list for each group by moving relevant buttons from the default bar.
@function create_submenu
@param {Object} params - arguments contain plugin, mapview and a group based on configuration
@returns {HTMLElement} unordered submenu list of buttons
*/
function create_submenu(params) {
  const sublist = [];

  for (const item of params.options) {
    const this_plugin = params.mapview.mapButton.querySelector(
      `[data-id="${item}"]`,
    );
    const subItem = mapp.utils.html.node`<li>${this_plugin}</li>`;
    sublist.push(subItem);
  }

  return mapp.utils.html`<ul class="submenu display-none">${sublist}`;
}

/**
Creates a click event for each group
@function group_on_click
@param {Object} e - click event from the group button
@returns {void}
*/
function group_on_click(e) {
  const container = e.target.closest('.core-menu');
  // find all most upper list items
  const li_items = container.querySelectorAll('ul:first-of-type li');
  // current list item
  const li_current = e.target.closest('li');
  // find all group buttons
  const group_buttons = container.querySelectorAll('button.group');
  // find all groups
  const groups = container.querySelectorAll('.submenu');
  // find the clicked group
  const current_group = container.querySelector(
    `li[data-group="${e.target.dataset.group}"] .submenu`,
  );
  // hide current group if shown
  if (li_current.classList.contains('active')) {
    hide_submenu(current_group);
    e.target.classList.remove('active');
    li_current.classList.remove('active');
    return;
  }
  // hide all groups
  for (const group of groups) {
    hide_submenu(group);
  }

  // turn off all buttons
  for (const group_button of group_buttons) {
    group_button.classList.remove('active');
  }

  // set all list items to non-active
  for (const li_item of li_items) {
    li_item.classList.remove('active');
  }

  li_current.classList.add('active');
  e.target.classList.add('active');
  // show only the current one
  show_submenu(current_group);
}

/**
Shows the group on click
@function show_submenu
@param {HTMLElement} group - current group of buttons that just got the click event
@returns {void}
*/
function show_submenu(group) {
  // find all buttons in the menu
  const group_buttons = group.querySelectorAll(
    'ul.submenu button, ul.submenu a',
  );
  // show this group
  group.classList.remove('display-none');
  // show all buttons in it, needed to ensure no hidden buttons are left behind
  for (const group_button of group_buttons) {
    group_button.style.display = 'block';
  }
}
/**
Hides the group on click leaving active buttons visible
@function hide_submenu
@param {HTMLElement} group - current group of buttons that just got the click event
@returns {void}
*/
function hide_submenu(group) {
  // find all buttons in the menu
  const group_buttons = group.querySelectorAll(
    'ul.submenu button, ul.submenu a',
  );
  // find active buttons
  const active_buttons = group.querySelectorAll('ul.submenu .active');
  // hide all group if no buttons are active
  if (!active_buttons) {
    group.classList.add('display-none');
    return;
  }
  // hide all inactive buttons, keep the active visible
  for (const group_button of group_buttons) {
    group_button.style.display = group_button.classList.contains('active')
      ? 'block'
      : 'none';
  }
}
