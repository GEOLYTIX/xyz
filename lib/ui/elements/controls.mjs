export default function controls(params) {
  for (let tab of params.tabs) {
    const elements = controlElements(tab, params.tabTarget, params.panelTarget);

    params.tabTarget.appendChild(elements.tab);
    params.panelTarget.appendChild(elements.panel);
  }

  params.panelTarget.children[0].classList.toggle('active');
  params.tabTarget.children[0].classList.toggle('active');

  params.ctrlTarget.appendChild(params.tabTarget);
  params.ctrlTarget.appendChild(params.panelTarget);

  return params.target;
}

function controlElements(tab, tabs, panels) {
  if (typeof tab === 'string') tab = { key: tab };

  tab.minWidth ??= 0;
  tab.icon ??= tab.key;
  tab.title = mapp.dictionary[tab.key] || tab.key;

  const tabStyle = tab.style
    ? Object.keys(tab.style).map((el) => `${el}: ${tab.style[el]}`)
    : '';

  const tab_el = mapp.utils.html.node`<div
          data-id=${tab.key}
          title=${tab.title}
          onclick=${(e) => tabClick(e, tabs, panels, tab)}
          class="notranslate material-symbols-outlined"
          style=${tabStyle}
        >${tab.icon}</div>`;

  const panel_el = mapp.utils.html.node`<div id=${tab.key}></div>`;

  return { tab: tab_el, panel: panel_el };
}

function tabClick(e, tabs, panels, tab) {
  // Change active class for the tab.
  for (const el of Array.from(tabs.children)) {
    el.classList.remove('active');
  }

  e.target.classList.add('active');

  // Change active class for the panel.
  for (const el of Array.from(panels.children)) {
    el.classList.remove('active');
  }

  document.getElementById(e.target.dataset.id).classList.add('active');

  // Adjust focus if the tab has a focus element.
  if (tab.focus) {
    tab.focus =
      tab.focus instanceof HTMLElement
        ? tab.focus
        : document.querySelector(tab.focus);

    tab.focus && globalThis.innerWidth > tab.minWidth && tab.focus.focus();
  }
}
