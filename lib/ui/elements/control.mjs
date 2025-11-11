/**
## /ui/elements/control

Module to export a method to decorate a control element with tabs and a panel.

@module /ui/elements/control
*/

/**
@function control

@param {Object} params
@property {HTMLElement} params.target The target for the control element.
@returns {Object} The ctrlTarget with the tab and panel appended.
*/
export default function control(params) {
  if (!params.target) return;

  params.target.classList.add('mapp-control');

  params.tabs = mapp.utils.html.node`<nav class="tabs hover">`;
  params.target.append(params.tabs);

  params.panels = mapp.utils.html.node`<div class="panels">`;
  params.target.append(params.panels);

  params.add = addControl;

  return params;
}

function addControl(params) {
  params.parent = this;
  params.minWidth ??= 0;
  params.icon ??= params.key;
  params.classList ??= 'notranslate material-symbols-outlined';
  params.onClick ??= onClick;
  params.title ??= mapp.dictionary[params.key] || params.key;
  params.panel ??= mapp.utils.html.node`<div>`;

  if (!this.tabs.children.length) {
    params.classList += ' active';
  }

  params.tab = mapp.utils.html.node`<div
    data-id=${params.key}
    title=${params.title}
    onclick=${(e) => params.onClick(e, params)}
    class=${params.classList}>
    ${params.icon}`;

  this.tabs.append(params.tab);
  this.panels.append(params.panel);
}

function onClick(e, params) {
  // Change active class for the tab.
  for (const el of Array.from(params.parent.tabs.children)) {
    el.classList.remove('active');
  }

  params.tab.classList.add('active');

  // Change active class for the panel.
  for (const el of Array.from(params.parent.panels.children)) {
    el.classList.remove('active');
  }

  params.panel.classList.add('active');

  // Adjust focus if the tab has a focus element.
  if (params.focus) {
    params.focus =
      params.focus instanceof HTMLElement
        ? params.focus
        : document.querySelector(`[name=${params.focus}]`);

    params.focus.focus();
  }
}
