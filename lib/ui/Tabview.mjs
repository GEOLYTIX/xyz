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
### mapp.ui.Tabview()

The Tabview decorator method will deocrate the tabview parameter argument as `typedef:tabview` and return the decorated tabview.

The tabview object has an addTab() method which can be called with through the `addTab` event listener added to the `tabview.node` HTMLElement.

@param {Object} tabview Object to decorate.
@property {HTMLElement} tabview.node Required HTML element to hold the tabview tabs and panel elements.

@return {tabview} Location view dataview and checkbox.
*/

export default function Tabview(tabview) {

  if (!tabview.node) return;

  tabview.tabs = tabview.node.appendChild(mapp.utils.html.node`<div class="tabs">`)

  tabview.panel = tabview.node.appendChild(mapp.utils.html.node`<div class="panel">`)

  // Set data attribute ID from element ID.
  tabview.id && tabview.node.setAttribute('data-id', tabview.id);

  tabview.addTab = addTab

  tabview.node.addEventListener('addTab', e => tabview.addTab(e.detail))

  return tabview;
}

/**
@function addTab

@description
The `tabview.addTab()` will decorate an entry object as a tabview tab. The method will return if the entry has already been decorated preventing the method to be accidentaly called twice with same param argument.

The tab decorator will add callbacks for the entry location or layer to trigger the display of the tabview when the associated mapp object status is toggled.

The decorator method will add `show()` and `hide()` methods for the tab.

@param {Object} entry The tab object to add to the tabview.
@property {HTMLElement} tabview.tab The tab shown in the tabview.tabs element.
*/

// add entry as tab to this tabview.
function addTab(entry) {

  // The entry already has a tab.
  if (entry.tab) return;

  const tabview = this

  entry.activate ??= function(){
    if (!entry.create || entry.dynamic) {
      entry.create ??= function () {
        mapp.ui.utils[entry.dataview]?.create(entry);
      }
      entry.create()
    }

    if (entry.update instanceof Function) {
      entry.update()
    }
  }

  if (entry.location) {
 
    // The tabview should be removed if the location is removed.
    entry.location.removeCallbacks.push(()=>entry.remove())

  } else if (entry.layer) {

    // Show tab when layer is displayed.
    entry.layer.showCallbacks.push(()=>{

      // Entry must have display flag.
      entry.display && entry.show()
    })
  
    // Hide tab when layer is hidden.
    entry.layer.hideCallbacks.push(()=>{
      entry.remove()
    })
  }

  entry.label ??= entry.title || entry.key || 'Tab'

  entry.tab = mapp.utils.html.node`
    <div class="tab">
      <button
        .disabled=${entry.disabled}
        class="header"
        style="${entry.tab_style || ''}"
        onclick=${showTab}>${entry.label}`
     
  entry.panel ??= entry.target || mapp.utils.html.node`
    <div class="${`panel ${entry.class || ''}`}">`

  entry.show = showTab

  entry.remove = removeTab

  function showTab (){

    // Render entry.panel into tabview.panel
    mapp.utils.render(tabview.panel, entry.panel)

    // Remove the active class from all tabs.
    tabview.tabs.childNodes.forEach(tab => tab.classList.remove('active'))

    // Add the tab element to tabs container if the tab element has no parent yet.
    !entry.tab.parentElement && tabview.tabs.append(entry.tab)

    // Make the tab active by assigning class.
    entry.tab.classList.add('active')

    // The activate event should be delayed with a timeout.
    // This prevents each tab to activate when multiple tabs are added in quick succession.
    tabview.timer && window.clearTimeout(tabview.timer)

    tabview.timer = window.setTimeout(entry.activate, 500)

    if (tabview.showTab instanceof Function) {

      // Execute tabview method to show a tab.
      tabview.showTab(entry)
    }
  }

  function removeTab () {

    // A tab without parent element cannot be in the tab bar.
    if (!entry.tab.parentElement) return

    // Find a sibling of the entry.
    const sibling = entry.tab.nextElementSibling || entry.tab.previousElementSibling

    // Remove the tab element from tab bar.
    entry.tab.remove()

    // Activate the sibling.
    if (sibling) return sibling.querySelector('.header').click()

    tabview.removeLastTab && tabview.removeLastTab()
  }
}