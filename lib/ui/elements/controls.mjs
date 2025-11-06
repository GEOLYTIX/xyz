/**
 * ### mapp.ui.elements.controls
 Module to export the elements associated with the controls element in the default view.
 This includes a tab and panel.

 futher exports a function that creates the tab control.

 * @module /ui/elements/controls
 */
export default {
  controls,
  controlElements,
};

/**
 @function controls
  Appends the tab and panel to the target element.

  @param {Object} params configuration options for the controls.
  @property {HTMLElement} tabTarget The target for the tab control.
  @property {HTMLElement} panelTarget The target for the panel associated with the tab control.
  @property {HTMLElement} ctrlTarget The parent element of both elements.

  @returns {HTMLElement} The ctrlTarget with the tab and panel appended.
*/
function controls(params) {
  for (const tab of params.tabs) {
    const elements = controlElements(tab, params.tabTarget, params.panelTarget);

    params.tabTarget.appendChild(elements.tab);
    params.panelTarget.appendChild(elements.panel);
  }

  //Set the first child as the active one.
  params.panelTarget.children[0].classList.toggle('active');
  params.tabTarget.children[0].classList.toggle('active');

  params.ctrlTarget.appendChild(params.tabTarget);
  params.ctrlTarget.appendChild(params.panelTarget);

  return params.ctrlTarget;
}

/**
 @function controlElements
 Creates the tab and the panel for the control.

 The tabs can be configured as follows..
 ```json
 locale:{
  controls: ["my_control",
            {
              key: "locations"
              icon: "location_on"
              style: {
                "display": "none"
              }
            }]
 }
 ```

 This would create a control with the data-id my_control and a panel with id of my_control.
 And a locations control with specified style and icon and panel with id locations.

 @param {Object|String} tab The configuration for the tab control.
 @param {HTMLElement} tabs The parent element for the tab controls.
 @property {String} [tab.key] The data-id of the tab and id of the panel.
 @property {String} [tab.icon] The name of a material symbols icon.
 @property {Object} [tab.style] The style attributes of the tab.
 @param {HTMLElement} panels The parent element for the panels.

 @returns {Object} Returns the panel and tab HTMLElements.
*/
function controlElements(tab, tabs, panels) {
  if (typeof tab === 'string') tab = { key: tab };

  tab.minWidth ??= 0;
  tab.icon ??= tab.key;
  tab.tabClick ??= tabClick;
  tab.title = mapp.dictionary[tab.key] || tab.key;

  //Turn style object into a string e.g. "<prop>: <value>"
  const tabStyle = tab.style
    ? Object.keys(tab.style).map((el) => `${el}: ${tab.style[el]}`)
    : '';

  const tab_el = mapp.utils.html.node`<div
          data-id=${tab.key}
          title=${tab.title}
          onclick=${(e) => tab.tabClick(e, tabs, panels, tab)}
          class="notranslate material-symbols-outlined"
          style=${tabStyle}
        >${tab.icon}</div>`;

  const panel_el = mapp.utils.html.node`<div id=${tab.key}></div>`;

  return { tab: tab_el, panel: panel_el };
}

/**
 @function tabClick
 The defualt event for clicking on a tab.
 The tab will be assigned the active class and the other tabs will be toggled off active.

 The panel associated with the tab will be set to display as well.
 @param {HTMLElement} e The tab element.
 @param {HTMLElement} tabs The parent element of all the tabs.
 @param {HTMLElement} panels The parent element of all the panels.
 @param {Object} tab The configuration options for the tab.
*/
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
