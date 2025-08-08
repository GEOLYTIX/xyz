/**
## ui/Tabview

The Tabview module exports the Tabview decorator method.

@module /ui/Tabview
*/

/**
@global
@typedef {Object} tabview
A tabview object is an element to display tabs and their associated panels.
@property {string} id
Unique id provided as object property to be assigned as data-id to the tabview.node.
@property {HTMLElement} node Required HTML element to hold the tabview tabs and panel elements.
@property {HTMLElement} tabs HTML element to hold add tab elements.
@property {HTMLElement} panel HTML element to display the panel element of the current active tab.
@property {Function} addTab Method to add a tab to the tabview.
*/

/**
@function Tabview

@description
The Tabview decorator method will deocrate the tabview parameter argument as `typedef:tabview` and return the decorated tabview.

The tabview object has an addTab() method which can be called with through the `addTab` event listener added to the `tabview.node` HTMLElement.

@param {Object} tabview Object to decorate.
@property {HTMLElement} tabview.node Required HTML element to hold the tabview tabs and panel elements.

@return {tabview} Decorated tabview typedef object.
*/

export default function Tabview(tabview) {
  if (!tabview.node) return;

  tabview.tabs =
    tabview.node.appendChild(mapp.utils.html.node`<div class="tabs">`);

  tabview.panel =
    tabview.node.appendChild(mapp.utils.html.node`<div class="panel">`);

  // Set data attribute ID from element ID.
  tabview.id && tabview.node.setAttribute('data-id', tabview.id);

  tabview.addTab = addTab;

  tabview.node.addEventListener('addTab', (e) => tabview.addTab(e.detail));

  return tabview;
}

/**
@function addTab

@description
The addTab() method is bound to the tabview [this] object in the decorator.

The `tabview.addTab()` will decorate an entry object as a tabview tab. The method will return if the entry has already been decorated preventing the method to be accidentaly called twice with same param argument.

The tab element itself will be assigned as tab property to the entry.

The tab decorator will add callbacks for the entry location or layer to trigger the display of the tabview when the associated mapp object status is toggled.

The decorator method will add `show()` and `hide()` methods for the tab.

@param {Object} entry The entry object will be decorated as a tabview tab.
@property {HTMLElement} entry.tab The entry object already has been added as a tab.
@property {location} [entry.location] A location associated with the entry.
@property {layer} [entry.layer] A layer associated with the entry.
@property {string} [entry.label] The title to be displayed in the tab element.
@property {HTMLElement} [entry.panel] The node element which will be displayed if the tab is active.
*/
function addTab(entry) {
  // The entry already has a tab, and is not flagged as dynamic.
  if (entry.tab && !entry.dynamic) return;

  const tabview = this;

  entry.activate ??= activateTab;

  if (entry.location) {
    // The tabview should be removed if the location is removed.
    entry.location.removeCallbacks.push(() => entry.remove());
  } else if (entry.layer) {
    // Show tab when layer is displayed.
    entry.layer.showCallbacks.push(() => {
      // Entry must have display flag.
      entry.display && entry.show();
    });

    // Hide tab when layer is hidden.
    entry.layer.hideCallbacks.push(() => {
      entry.remove();
    });
  }

  entry.label ??= entry.title || entry.key || 'Tab';

  entry.tab = mapp.utils.html.node`
    <div class="tab">
      <button
        .disabled=${entry.disabled}
        class="header"
        style="${entry.tab_style || ''}"
        onclick=${showTab}>${entry.label}`;

  entry.panel ??=
    entry.target ||
    mapp.utils.html.node`
    <div class="${`panel ${entry.class || ''}`}">`;

  entry.show = showTab;

  entry.remove = removeTab;

  // Must override dataview hide method.
  entry.hide = removeTab;

  /**
  @function activateTab

  @description
  The activateTab method is debounced for tabs being shown/added to a tabview. A tab may be a dataview object which requires to be created/updated within the context of the tab.

  The dataview may have an associated toolbar [btnRow element] which must be displayed.
  */
  function activateTab() {
    if (entry.create === undefined) {
      entry.create ??= function () {
        mapp.ui.utils[entry.dataview]?.create(entry);
      };

      entry.create();
    } else if (entry.dynamic) {
      entry.create();
    }

    // Dataviews with the dynamic flag will always update.
    if (!entry.data || entry.dynamic) {
      entry.update?.();
    }

    //Show toolbar buttons if there are any
    entry.btnRow?.style.setProperty('display', 'flex');
  }

  /**
  @function showTab

  @description
  The showTab() method will be assigned as `entry.show()` method to a decorated tabview tab. The method is associated with the tab element click event which activates a tab. The '.active` class will be added to the tab element classList.

  The showTab method is debounced by 500ms to execute only for the last tab to be added when multiple tabs are added in quick succession.
  */
  function showTab() {
    // Render entry.panel into tabview.panel
    mapp.utils.render(tabview.panel, entry.panel);

    // Remove the active class from all tabs.
    tabview.tabs.childNodes.forEach((tab) => tab.classList.remove('active'));

    // Add the tab element to tabs container if the tab element has no parent yet.
    !entry.tab.parentElement && tabview.tabs.append(entry.tab);

    // Make the tab active by assigning class.
    entry.tab.classList.add('active');

    // The activate event should be delayed with a timeout.
    // This prevents each tab to activate when multiple tabs are added in quick succession.
    tabview.timer && window.clearTimeout(tabview.timer);

    tabview.timer = window.setTimeout(() => entry.activate(), 500);

    if (tabview.showTab instanceof Function) {
      // Execute tabview method to show a tab.
      tabview.showTab();
    }
  }

  /**
  @function removeTab

  @description
  The removeTab() method will be assigned as `entry.remove()` as well as `entry.hide()` methods to a decorated tabview tab.

  A tab may be a dataview which has it's own show method, but not a remove method.

  The method iterates through all sibling tab elements to activate the next tab if a tab is removed.

  The removeLastTab() method of the tabview will be executed if the last tab object is removed from a tabview.
  */
  function removeTab() {
    // A tab without parent element cannot be in the tab bar.
    if (!entry.tab.parentElement) return;

    // Find a sibling of the entry.
    const sibling =
      entry.tab.nextElementSibling || entry.tab.previousElementSibling;

    // Remove the tab element from tab bar.
    entry.tab.remove();

    // Activate the sibling.
    if (sibling) return sibling.querySelector('.header').click();

    tabview.removeLastTab?.();
  }
}
